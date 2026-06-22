import "reflect-metadata";
import { createHash } from "crypto";
import {
  DescriptionFormat,
  JobType,
  ScraperInputDto,
  Site,
} from "@ever-jobs/models";

const mockGet = jest.fn();
jest.mock("@ever-jobs/common", () => {
  const actual = jest.requireActual("@ever-jobs/common");
  return {
    ...actual,
    createHttpClient: jest.fn(() => ({
      get: mockGet,
      setHeaders: jest.fn(),
    })),
  };
});

import { RipplingService } from "../src/rippling.service";
import { RipplingJob } from "../src/rippling.types";

function uuid(seed: string): string {
  const hex = createHash("sha256").update(seed).digest("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-8${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
}

function job(seed: string, title = `Role ${seed}`): RipplingJob {
  const id = uuid(seed);
  return {
    uuid: id,
    title,
    companyName: "Boom Supersonic",
    url: `https://ats.rippling.com/boom-supersonic/jobs/${id}`,
    locations: [{ city: "Centennial", state: "CO", country: "US" }],
    description: { role: `Description for ${title}` },
  };
}

function page(items: RipplingJob[]): string {
  return pageWithQueries([items]);
}

function pageWithQueries(itemArrays: unknown[][]): string {
  return `<!doctype html><script id="__NEXT_DATA__" type="application/json">${JSON.stringify(
    {
      props: {
        pageProps: {
          dehydratedState: {
            queries: itemArrays.map((items) => ({
              state: { data: { items } },
            })),
          },
        },
      },
    },
  )}</script>`;
}

describe("RipplingService pagination", () => {
  beforeEach(() => mockGet.mockReset());

  it("collects unique jobs across zero-based pages until exhaustion", async () => {
    mockGet
      .mockResolvedValueOnce({ data: page([job("a"), job("b")]) })
      .mockResolvedValueOnce({ data: page([job("c")]) })
      .mockResolvedValueOnce({ data: page([]) });

    const result = await new RipplingService().scrape({
      companySlug: "boom-supersonic",
      siteType: [Site.RIPPLING],
      resultsWanted: 9999,
    } as ScraperInputDto);

    expect(result.jobs.map((item) => item.atsId)).toEqual([
      uuid("a"),
      uuid("b"),
      uuid("c"),
    ]);
    expect(mockGet.mock.calls.map((call) => call[0])).toEqual([
      "https://ats.rippling.com/boom-supersonic/jobs?page=0&jobBoardSlug=boom-supersonic",
      "https://ats.rippling.com/boom-supersonic/jobs?page=1&jobBoardSlug=boom-supersonic",
      "https://ats.rippling.com/boom-supersonic/jobs?page=2&jobBoardSlug=boom-supersonic",
    ]);
  });

  it("stops requesting pages as soon as resultsWanted is satisfied", async () => {
    mockGet.mockResolvedValueOnce({ data: page([job("a"), job("b")]) });

    const result = await new RipplingService().scrape({
      companySlug: "boom-supersonic",
      resultsWanted: 1,
    } as ScraperInputDto);

    expect(result.jobs).toHaveLength(1);
    expect(result.jobs[0].atsId).toBe(uuid("a"));
    expect(mockGet).toHaveBeenCalledTimes(1);
  });

  it("fetches a missing description from the public detail endpoint", async () => {
    const listed = job("detail", "Detailed Role");
    delete listed.description;
    mockGet
      .mockResolvedValueOnce({ data: page([listed]) })
      .mockResolvedValueOnce({
        data: {
          description: {
            company: "<p>Company <strong>introduction</strong></p>",
            role: "<h2>Role details</h2><p>Contact jobs@boom.test</p>",
          },
          applyUrl:
            "https://ats.rippling.com/boom-supersonic/jobs/detail/apply",
        },
      });

    const result = await new RipplingService().scrape({
      companySlug: "boom-supersonic",
      resultsWanted: 1,
      descriptionFormat: DescriptionFormat.PLAIN,
    } as ScraperInputDto);

    expect(result.jobs[0]).toMatchObject({
      description:
        "Company introduction\n\nRole details\nContact jobs@boom.test",
      emails: ["jobs@boom.test"],
      applyUrl: "https://ats.rippling.com/boom-supersonic/jobs/detail/apply",
    });
    expect(mockGet.mock.calls[1][0]).toBe(
      `https://ats.rippling.com/api/v2/board/boom-supersonic/jobs/${uuid("detail")}`,
    );
  });

  it.each([
    [
      DescriptionFormat.HTML,
      "<p>Company <strong>intro</strong></p>\n\n<h2>Role</h2>",
    ],
    [DescriptionFormat.MARKDOWN, "Company **intro**\n\nRole\n----"],
    [DescriptionFormat.PLAIN, "Company intro\n\nRole"],
  ])("formats detail HTML as %s", async (descriptionFormat, expected) => {
    const listed = job(`format-${descriptionFormat}`);
    delete listed.description;
    mockGet
      .mockResolvedValueOnce({ data: page([listed]) })
      .mockResolvedValueOnce({
        data: {
          description: {
            company: "<p>Company <strong>intro</strong></p>",
            role: "<h2>Role</h2>",
          },
        },
      });

    const result = await new RipplingService().scrape({
      companySlug: "boom-supersonic",
      resultsWanted: 1,
      descriptionFormat,
    } as ScraperInputDto);

    expect(result.jobs[0].description).toBe(expected);
  });

  it("keeps a valid list job when its detail request fails", async () => {
    const listed = job("detail-failure");
    delete listed.description;
    mockGet
      .mockResolvedValueOnce({ data: page([listed]) })
      .mockRejectedValueOnce(new Error("HTTP 503"));

    const result = await new RipplingService().scrape({
      companySlug: "boom-supersonic",
      resultsWanted: 1,
    } as ScraperInputDto);

    expect(result.jobs).toHaveLength(1);
    expect(result.jobs[0].description).toBeNull();
  });

  it("bounds detail enrichment to five simultaneous requests", async () => {
    const listed = Array.from({ length: 6 }, (_value, index) => {
      const item = job(`concurrency-${index}`);
      delete item.description;
      return item;
    });
    let active = 0;
    let maximumActive = 0;
    mockGet
      .mockResolvedValueOnce({ data: page(listed) })
      .mockImplementation(async () => {
        active++;
        maximumActive = Math.max(maximumActive, active);
        await new Promise((resolve) => setTimeout(resolve, 2));
        active--;
        return { data: { description: { role: "<p>Detailed role</p>" } } };
      });

    const result = await new RipplingService().scrape({
      companySlug: "boom-supersonic",
      resultsWanted: 6,
    } as ScraperInputDto);

    expect(result.jobs).toHaveLength(6);
    expect(maximumActive).toBe(5);
    expect(mockGet).toHaveBeenCalledTimes(7);
  });

  it("stops when an out-of-range page repeats existing source IDs", async () => {
    mockGet
      .mockResolvedValueOnce({ data: page([job("a"), job("b")]) })
      .mockResolvedValueOnce({ data: page([job("b"), job("a")]) });

    const result = await new RipplingService().scrape({
      companySlug: "boom-supersonic",
      resultsWanted: 9999,
    } as ScraperInputDto);

    expect(result.jobs.map((item) => item.atsId)).toEqual([
      uuid("a"),
      uuid("b"),
    ]);
    expect(mockGet).toHaveBeenCalledTimes(2);
  });

  it("deduplicates repeated IDs while retaining unseen jobs on later pages", async () => {
    mockGet
      .mockResolvedValueOnce({ data: page([job("a"), job("b")]) })
      .mockResolvedValueOnce({ data: page([job("b"), job("c")]) })
      .mockResolvedValueOnce({ data: page([]) });

    const result = await new RipplingService().scrape({
      companySlug: "boom-supersonic",
      resultsWanted: 9999,
    } as ScraperInputDto);

    expect(result.jobs.map((item) => item.atsId)).toEqual([
      uuid("a"),
      uuid("b"),
      uuid("c"),
    ]);
  });

  it("returns partial results when a later page fails", async () => {
    mockGet
      .mockResolvedValueOnce({ data: page([job("a"), job("b")]) })
      .mockRejectedValueOnce(new Error("HTTP 500"));

    const result = await new RipplingService().scrape({
      companySlug: "boom-supersonic",
      resultsWanted: 9999,
    } as ScraperInputDto);

    expect(result.jobs.map((item) => item.atsId)).toEqual([
      uuid("a"),
      uuid("b"),
    ]);
  });

  it("does not impose a 100-job cap", async () => {
    const jobs = Array.from({ length: 125 }, (_value, index) =>
      job(`job-${index}`),
    );
    mockGet
      .mockResolvedValueOnce({ data: page(jobs) })
      .mockResolvedValueOnce({ data: page([]) });

    const result = await new RipplingService().scrape({
      companySlug: "boom-supersonic",
      resultsWanted: 9999,
    } as ScraperInputDto);

    expect(result.jobs).toHaveLength(125);
  });

  it("rejects filter items and selects the strict job-shaped query", async () => {
    const bogusItems = [
      { name: "Centennial, CO" },
      { id: uuid("filter"), name: "Engineering" },
    ];
    mockGet
      .mockResolvedValueOnce({
        data: pageWithQueries([bogusItems, [job("real", "Real Engineer")]]),
      })
      .mockResolvedValueOnce({ data: page([]) });

    const result = await new RipplingService().scrape({
      companySlug: "boom-supersonic",
      resultsWanted: 9999,
    } as ScraperInputDto);

    expect(result.jobs).toHaveLength(1);
    expect(result.jobs[0]).toMatchObject({
      id: `rippling-${uuid("real")}`,
      atsId: uuid("real"),
      title: "Real Engineer",
      companyUrl: "https://ats.rippling.com/boom-supersonic/jobs",
    });
    expect(result.jobs[0].jobUrl).not.toContain("undefined");
  });

  it("returns no rows when dehydrated items contain only filter data", async () => {
    mockGet.mockResolvedValueOnce({
      data: pageWithQueries([[{ name: "Centennial, CO" }]]),
    });

    const result = await new RipplingService().scrape({
      companySlug: "boom-supersonic",
      resultsWanted: 9999,
    } as ScraperInputDto);

    expect(result.jobs).toEqual([]);
  });

  it("returns no jobs without a slug or when resultsWanted is zero", async () => {
    await expect(
      new RipplingService().scrape({ resultsWanted: 10 } as ScraperInputDto),
    ).resolves.toEqual({ jobs: [] });
    await expect(
      new RipplingService().scrape({
        companySlug: "boom-supersonic",
        resultsWanted: 0,
      } as ScraperInputDto),
    ).resolves.toEqual({ jobs: [] });
    expect(mockGet).not.toHaveBeenCalled();
  });

  it("normalizes mapped types and preserves only unmapped raw labels", async () => {
    const mapped = job("mapped-type");
    mapped.employmentType = { label: "Full-time" };
    mapped.applyUrl = mapped.url;
    mapped.locations = [
      { name: "Centennial Campus", stateCode: "CO", countryCode: "US" },
    ];
    const unmapped = job("unmapped-type");
    unmapped.employmentType = { label: "Seasonal specialist" };
    unmapped.locations = [];
    unmapped.workLocations = ["Remote - United States"];

    mockGet
      .mockResolvedValueOnce({ data: page([mapped, unmapped]) })
      .mockResolvedValueOnce({ data: page([]) });

    const result = await new RipplingService().scrape({
      companySlug: "boom-supersonic",
      resultsWanted: 9999,
    } as ScraperInputDto);

    expect(result.jobs[0]).toMatchObject({
      jobType: [JobType.FULL_TIME],
      location: { city: "Centennial Campus", state: "CO", country: "US" },
    });
    expect(result.jobs[0]).not.toHaveProperty("employmentType");
    expect(result.jobs[0]).not.toHaveProperty("applyUrl");
    expect(result.jobs[1]).toMatchObject({
      employmentType: "Seasonal specialist",
      location: { city: "Remote - United States" },
      isRemote: true,
    });
    expect(result.jobs[1]).not.toHaveProperty("jobType");
  });
});
