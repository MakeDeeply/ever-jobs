export interface SyncereSearchIndex {
    [path: string]: SyncerePage;
}

export interface SyncerePage {
    version?: number;
    title?: string;
    description?: string;
    keywords?: string;
    h1?: string[];
    h2?: string[];
    h3?: string[];
    h4?: string[];
    h5?: string[];
    h6?: string[];
    p?: string[];
    codeblock?: string[];
    url?: string;
}
