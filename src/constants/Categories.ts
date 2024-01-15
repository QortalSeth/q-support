import softwareIcon from "../assets/icons/software.webp";
import gamingIcon from "../assets/icons/gaming.webp";
import mediaIcon from "../assets/icons/media.webp";
import videoIcon from "../assets/icons/video.webp";
import audioIcon from "../assets/icons/audio.webp";
import documentIcon from "../assets/icons/document.webp";

interface SubCategory {
    id: number;
    name: string;
}

interface Categories {
    [key: number]: SubCategory[];
}

const sortCategory = (a: SubCategory, b: SubCategory) => {
    if (a.name === "Other") return 1;
    else if (b.name === "Other") return -1;
    else return a.name.localeCompare(b.name);
};

export const categories = [
    {"id": 1, "name": "Software"},
    {"id": 2, "name": "Gaming"},
    {"id": 3, "name": "Media"},
    {"id": 4, "name": "Other"}
].sort(sortCategory);
export const subCategories: Categories = {
    1: [
        {"id": 101, "name": "OS"},
        {"id": 102, "name": "Application"},
        {"id": 103, "name": "Source Code"},
        {"id": 104, "name": "Other"}
    ].sort(sortCategory),
    2: [
        {"id": 201, "name": "NES"},
        {"id": 202, "name": "SNES"},
        {"id": 203, "name": "PC"},
        {"id": 204, "name": "Other"}
    ].sort(sortCategory),
    3: [
        {"id": 301, "name": "Audio"},
        {"id": 302, "name": "Video"},
        {"id": 303, "name": "Image"},
        {"id": 304, "name": "Document"},
        {"id": 305, "name": "Other"}
    ].sort(sortCategory)
};

const gamingSystems = [
        {"id": 20101, "name": "ROM"},
        {"id": 20102, "name": "Romhack"},
        {"id": 20103, "name": "Emulator"},
        {"id": 20104, "name": "Guide"},
        {"id": 20105, "name": "Other"},
    ].sort(sortCategory)
export const subCategories2: Categories = {
    201: gamingSystems,  // NES
    202: gamingSystems,  // SNES
    301: [ // Audio
        {"id": 30101, "name": "Music"},
        {"id": 30102, "name": "Podcasts"},
        {"id": 30103, "name": "Audiobooks"},
        {"id": 30104, "name": "Sound Effects"},
        {"id": 30105, "name": "Lectures & Speeches"},
        {"id": 30106, "name": "Radio Shows"},
        {"id": 30107, "name": "Ambient Sounds"},
        {"id": 30108, "name": "Language Learning Material"},
        {"id": 30109, "name": "Comedy & Satire"},
        {"id": 30110, "name": "Documentaries"},
        {"id": 30111, "name": "Guided Meditations & Yoga"},
        {"id": 30112, "name": "Live Performances"},
        {"id": 30113, "name": "Nature Sounds"},
        {"id": 30114, "name": "Soundtracks"},
        {"id": 30115, "name": "Interviews"}
    ].sort(sortCategory),
    302: [ // Under Video
        {"id": 30201, "name": "Movies"},
        {"id": 30202, "name": "Series"},
        {"id": 30203, "name": "Music"},
        {"id": 30204, "name": "Education"},
        {"id": 30205, "name": "Lifestyle"},
        {"id": 30206, "name": "Gaming"},
        {"id": 30207, "name": "Technology"},
        {"id": 30208, "name": "Sports"},
        {"id": 30209, "name": "News & Politics"},
        {"id": 30210, "name": "Cooking & Food"},
        {"id": 30211, "name": "Animation"},
        {"id": 30212, "name": "Science"},
        {"id": 30213, "name": "Health & Wellness"},
        {"id": 30214, "name": "DIY & Crafts"},
        {"id": 30215, "name": "Kids & Family"},
        {"id": 30216, "name": "Comedy"},
        {"id": 30217, "name": "Travel & Adventure"},
        {"id": 30218, "name": "Art & Design"},
        {"id": 30219, "name": "Nature & Environment"},
        {"id": 30220, "name": "Business & Finance"},
        {"id": 30221, "name": "Personal Development"},
        {"id": 30222, "name": "Other"},
        {"id": 30223, "name": "History"}
    ].sort(sortCategory),
    303: [ // Image
        {"id": 30301, "name": "Nature"},
        {"id": 30302, "name": "Urban & Cityscapes"},
        {"id": 30303, "name": "People & Portraits"},
        {"id": 30304, "name": "Art & Abstract"},
        {"id": 30305, "name": "Travel & Adventure"},
        {"id": 30306, "name": "Animals & Wildlife"},
        {"id": 30307, "name": "Sports & Action"},
        {"id": 30308, "name": "Food & Cuisine"},
        {"id": 30309, "name": "Fashion & Beauty"},
        {"id": 30310, "name": "Technology & Science"},
        {"id": 30311, "name": "Historical & Cultural"},
        {"id": 30312, "name": "Aerial & Drone"},
        {"id": 30313, "name": "Black & White"},
        {"id": 30314, "name": "Events & Celebrations"},
        {"id": 30315, "name": "Business & Corporate"},
        {"id": 30316, "name": "Health & Wellness"},
        {"id": 30317, "name": "Transportation & Vehicles"},
        {"id": 30318, "name": "Still Life & Objects"},
        {"id": 30319, "name": "Architecture & Buildings"},
        {"id": 30320, "name": "Landscapes & Seascapes"}
    ].sort(sortCategory),
    304: [ // Document
        {"id": 30401, "name": "PDF"},
        {"id": 30402, "name": "Word Document"},
        {"id": 30403, "name": "Spreadsheet"},
        {"id": 30404, "name": "Powerpoint"},
        {"id": 30405, "name": "Books"}
    ].sort(sortCategory)
};
export const subCategories3: Categories = {
    30201: [ // Under Movies
        {"id": 3020101, "name": "Action & Adventure"},
        {"id": 3020102, "name": "Comedy"},
        {"id": 3020103, "name": "Drama"},
        {"id": 3020104, "name": "Fantasy & Science Fiction"},
        {"id": 3020105, "name": "Horror & Thriller"},
        {"id": 3020106, "name": "Documentaries"},
        {"id": 3020107, "name": "Animated"},
        {"id": 3020108, "name": "Family & Kids"},
        {"id": 3020109, "name": "Romance"},
        {"id": 3020110, "name": "Mystery & Crime"},
        {"id": 3020111, "name": "Historical & War"},
        {"id": 3020112, "name": "Musicals & Music Films"},
        {"id": 3020113, "name": "Indie Films"},
        {"id": 3020114, "name": "International Films"},
        {"id": 3020115, "name": "Biographies & True Stories"},
        {"id": 3020116, "name": "Other"}
    ].sort(sortCategory),
    30202: [ // Under Series
        {"id": 3020201, "name": "Dramas"},
        {"id": 3020202, "name": "Comedies"},
        {"id": 3020203, "name": "Reality & Competition"},
        {"id": 3020204, "name": "Documentaries & Docuseries"},
        {"id": 3020205, "name": "Sci-Fi & Fantasy"},
        {"id": 3020206, "name": "Crime & Mystery"},
        {"id": 3020207, "name": "Animated Series"},
        {"id": 3020208, "name": "Kids & Family"},
        {"id": 3020209, "name": "Historical & Period Pieces"},
        {"id": 3020210, "name": "Action & Adventure"},
        {"id": 3020211, "name": "Horror & Thriller"},
        {"id": 3020212, "name": "Romance"},
        {"id": 3020213, "name": "Anthologies"},
        {"id": 3020214, "name": "International Series"},
        {"id": 3020215, "name": "Miniseries"},
        {"id": 3020216, "name": "Other"}
    ].sort(sortCategory),
    30405: [ // Under Books
        {"id": 3040501, "name": "Fiction"},
        {"id": 3040502, "name": "Non-Fiction"},
        {"id": 3040503, "name": "Science Fiction & Fantasy"},
        {"id": 3040504, "name": "Biographies & Memoirs"},
        {"id": 3040505, "name": "Children's Books"},
        {"id": 3040506, "name": "Educational"},
        {"id": 3040507, "name": "Self-Help"},
        {"id": 3040508, "name": "Cookbooks, Food & Wine"},
        {"id": 3040509, "name": "Mystery & Thriller"},
        {"id": 3040510, "name": "History"},
        {"id": 3040511, "name": "Poetry"},
        {"id": 3040512, "name": "Art & Photography"},
        {"id": 3040513, "name": "Religion & Spirituality"},
        {"id": 3040514, "name": "Travel"},
        {"id": 3040515, "name": "Comics & Graphic Novels"},

    ].sort(sortCategory),
    30101: [ // Under Music
        {"id": 3010101, "name": "Rock"},
        {"id": 3010102, "name": "Pop"},
        {"id": 3010103, "name": "Classical"},
        {"id": 3010104, "name": "Jazz"},
        {"id": 3010105, "name": "Electronic"},
        {"id": 3010106, "name": "Country"},
        {"id": 3010107, "name": "Hip Hop/Rap"},
        {"id": 3010108, "name": "Blues"},
        {"id": 3010109, "name": "R&B/Soul"},
        {"id": 3010110, "name": "Reggae"},
        {"id": 3010111, "name": "Folk"},
        {"id": 3010112, "name": "Metal"},
        {"id": 3010113, "name": "World Music"},
        {"id": 3010114, "name": "Latin"},
        {"id": 3010115, "name": "Indie"},
        {"id": 3010116, "name": "Punk"},
        {"id": 3010117, "name": "Soundtracks"},
        {"id": 3010118, "name": "Children's Music"},
        {"id": 3010119, "name": "New Age"},
        {"id": 3010120, "name": "Classical Crossover"}
    ].sort(sortCategory)


};
export const icons = {
    1: softwareIcon,
    2: gamingIcon,
    3: mediaIcon,
    4: softwareIcon,
    302: videoIcon,
    301: audioIcon,
    304: documentIcon
}