import { StaticImageData } from "next/image";

// IMPORTANT: Add your certificate images to public/certificates/ folder with these exact names:
// - cs50-certificate.jpg (or .png, .webp)
// - mimo-sql-certificate.jpg (or .png, .webp)
// - mimo-webdev-certificate.jpg (or .png, .webp)
// - harvard-logo.png (optional - for organization logo)
// - mimo-logo.png (optional - for organization logo)

// Temporary placeholder - replace with actual certificate images
import profilePlaceholder from "../../public/profile.webp";

// Certificate images - TODO: Replace these with actual certificate images
// Once you add the images, update the imports like this:
// import cs50Cert from "../../public/certificates/cs50-certificate.jpg";
// import mimoSqlCert from "../../public/certificates/mimo-sql-certificate.jpg";
// import mimoWebDevCert from "../../public/certificates/mimo-webdev-certificate.jpg";

// For now, using placeholder until images are added
const cs50Cert = profilePlaceholder;
const mimoSqlCert = profilePlaceholder;
const mimoWebDevCert = profilePlaceholder;

// Organization logos - TODO: Replace with actual logos
// import harvardLogo from "../../public/certificates/harvard-logo.png";
// import mimoLogo from "../../public/certificates/mimo-logo.png";
const harvardLogo = profilePlaceholder;
const mimoLogo = profilePlaceholder;

export type certificateProps = {
  certificateImage: StaticImageData;
  detailUrl: string;
  organizationName: string;
  organizationLogo: StaticImageData;
  certificateDetails: string;
  slug: string;
  index: number;
  // Enhanced fields for detailed modal view
  certificateTitle?: string;
  recipientName?: string;
  achievementDescription?: string;
  awardedBy?: string;
  signatory?: {
    name: string;
    title: string;
  };
  location?: string;
  issueDate?: string;
  curriculumDetails?: string[];
};

export const certificateDetails: certificateProps[] = [
  {
    certificateImage: cs50Cert,
    detailUrl: "https://cs50.harvard.edu/certificates/d55fd4b8-a1c0-4332-9583-cb25cc92aa91",
    organizationName: "Harvard University",
    organizationLogo: harvardLogo,
    certificateDetails: "CS50 Certificate - Completed CS50x, including ten problem sets, eight labs, and one final project. This intensive computer science course from Harvard University covers fundamental programming concepts, data structures, algorithms, and web development.",
    slug: "harvard-cs50",
    index: 0,
    certificateTitle: "CS50 Certificate",
    recipientName: "Waqas Ul Haq Qureshi",
    achievementDescription: "Completed CS50x, including ten problem sets, eight labs, and one final project.",
    awardedBy: "Harvard University",
    signatory: {
      name: "David J. Malan",
      title: "Gordon McKay Professor of the Practice of Computer Science"
    },
    location: "Cambridge, Massachusetts",
    issueDate: "2022",
    curriculumDetails: [
      "Ten problem sets covering fundamental programming concepts",
      "Eight labs focusing on practical implementation",
      "One comprehensive final project demonstrating mastery of concepts",
      "Coverage of C, Python, SQL, JavaScript, HTML, and CSS",
      "Introduction to algorithms and data structures",
      "Web development fundamentals and best practices"
    ],
  },
  {
    certificateImage: mimoSqlCert,
    detailUrl: "",
    organizationName: "Mimo",
    organizationLogo: mimoLogo,
    certificateDetails: "SQL Certificate of Achievement - Successfully completed the SQL curriculum from Mimo. This certification demonstrates proficiency in database management, including creating tables, writing complex queries, and managing relational databases.",
    slug: "mimo-sql",
    index: 1,
    certificateTitle: "Certificate of Achievement",
    recipientName: "Waqas Ul Haq Qureshi",
    achievementDescription: "SQL",
    awardedBy: "Mimo",
    signatory: {
      name: "Johannes Berger",
      title: "CEO, Mimo"
    },
    location: "",
    issueDate: "September 22, 2023",
    curriculumDetails: [
      "Understanding of core concepts of SQL required to create tables",
      "Ability to gain insights into data by writing queries over one or multiple tables",
      "Practical knowledge needed to combine these skills to manage a basic relational database",
      "Database design and normalization principles",
      "Data manipulation and retrieval techniques",
      "Query optimization and performance best practices"
    ],
  },
  {
    certificateImage: mimoWebDevCert,
    detailUrl: "",
    organizationName: "Mimo",
    organizationLogo: mimoLogo,
    certificateDetails: "Web Development Certificate of Achievement - Successfully completed the Web Development curriculum from Mimo. This certification covers JavaScript programming, HTML web page creation, CSS styling, and the practical experience needed to publish websites on the internet.",
    slug: "mimo-web-development",
    index: 2,
    certificateTitle: "Certificate of Achievement",
    recipientName: "Waqas Ul Haq Qureshi",
    achievementDescription: "Web Development",
    awardedBy: "Mimo",
    signatory: {
      name: "Johannes Berger",
      title: "CEO, Mimo"
    },
    location: "",
    issueDate: "September 22, 2023",
    curriculumDetails: [
      "Understanding of core concepts of programming using JavaScript",
      "HTML knowledge required to create web pages",
      "Ability to style pages using CSS",
      "Practical experience needed to combine these technologies",
      "Skills to publish a website on the internet",
      "Modern web development practices and responsive design"
    ],
  },
];
