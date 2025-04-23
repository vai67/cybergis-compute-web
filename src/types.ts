export type AnnouncementType = {
    message: string;
    poster: string;
    time_stamp: string;
}
// export type JobType = {
//     link: string;
//     name: string;
//     container: string;
//     repository: string;
//     commit: string;
// }
// export type HpcType = {
//     hpc: string;
//     ip: string;
//     port: string;
//     is_community_account: boolean;
// }
export type ListData = {
    data: {
        announcements: AnnouncementType[];
        jobsKeys: string[];
        hpcsKeys: string[];
    }
}