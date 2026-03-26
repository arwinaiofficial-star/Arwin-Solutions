export type ClientSector = "Government" | "Education" | "Enterprise";

export type ClientLogo = {
  name: string;
  slug: string;
  image: string;
  sector: ClientSector;
  imageScale?: number;
  highlight: string;
};

export const clientLogos: ClientLogo[] = [
  {
    name: "NTPC",
    slug: "ntpc",
    image: "/logos/cleaned/ntpc.png",
    sector: "Government",
    highlight: "Corporate and public information portals for India's premier power company.",
  },
  {
    name: "Travancore Devaswom Board",
    slug: "travancore-devaswom-board",
    image: "/logos/cleaned/travancore-devaswom-board.png",
    sector: "Government",
    highlight: "Temple-board websites focused on transparency and service delivery.",
  },
  {
    name: "Adarsh Motors",
    slug: "adarsh-motors",
    image: "/logos/cleaned/adarsh-motors.png",
    sector: "Enterprise",
    highlight: "Responsive dealership websites built for lead generation and support.",
  },
  {
    name: "Aditya Ayurvedam",
    slug: "aditya-ayurvedam",
    image: "/logos/cleaned/aditya-ayurvedam.png",
    sector: "Enterprise",
    highlight: "Wellness portals presenting treatments, bookings, and healthcare offerings.",
  },
  {
    name: "Akshara Group",
    slug: "akshara-group",
    image: "/logos/cleaned/akshara-group.png",
    sector: "Education",
    highlight: "Education-group websites centered on admissions and academic highlights.",
  },
  {
    name: "Amrutha IVF",
    slug: "amrutha-ivf",
    image: "/logos/cleaned/amrutha-ivf.png",
    sector: "Enterprise",
    highlight: "Healthcare platforms supporting awareness, appointments, and patient education.",
  },
  {
    name: "CBIT",
    slug: "cbit",
    image: "/logos/cleaned/cbit.png",
    sector: "Education",
    highlight: "Academic websites improving institutional outreach and student engagement.",
  },
  {
    name: "Cheeriyal Lakshmi Narasimha",
    slug: "cheeriyal-lakshmi-narasimha",
    image: "/logos/cleaned/cheeriyal-lakshmi-narasimha.png",
    sector: "Government",
    imageScale: 1.12,
    highlight: "Temple portals designed for pilgrim information and booking-friendly access.",
  },
  {
    name: "Geetanjali College",
    slug: "geetanjali-college",
    image: "/logos/cleaned/geetanjali-college.png",
    sector: "Education",
    highlight: "Integrated college platforms for admissions, resources, and campus activity.",
  },
  {
    name: "DRDA",
    slug: "drda",
    image: "/logos/cleaned/drda.png",
    sector: "Government",
    highlight: "Rural-development platforms built for visibility and public participation.",
  },
  {
    name: "Government of Telangana",
    slug: "government-of-telangana",
    image: "/logos/cleaned/government-of-telangana.png",
    sector: "Government",
    imageScale: 1.08,
    highlight: "Citizen-facing government websites for secure service communication.",
  },
  {
    name: "Indian Railways",
    slug: "indian-railways",
    image: "/logos/cleaned/indian-railways.png",
    sector: "Government",
    highlight: "Public-facing modules for large-scale transport information access.",
  },
  {
    name: "Jeeyar Education Trust",
    slug: "jeeyar-education-trust",
    image: "/logos/cleaned/jeeyar-education-trust.png",
    sector: "Education",
    imageScale: 1.18,
    highlight: "Educational-trust sites supporting events, visibility, and contribution tracking.",
  },
  {
    name: "Kapil Group",
    slug: "kapil-group",
    image: "/logos/cleaned/kapil-group.png",
    sector: "Enterprise",
    highlight: "Interactive corporate websites for diversified business portfolios.",
  },
  {
    name: "Keesara",
    slug: "keesara",
    image: "/logos/cleaned/keesara.png",
    sector: "Government",
    imageScale: 1.08,
    highlight: "Mobile-optimized temple websites for events, updates, and donors.",
  },
  {
    name: "Kendriya Vidyalaya Sangathan",
    slug: "kendriya-vidyalaya-sangathan",
    image: "/logos/cleaned/kendriya-vidyalaya-sangathan.png",
    sector: "Education",
    highlight: "Scalable school portals for one of India's largest education networks.",
  },
  {
    name: "National Informatics Centre",
    slug: "nic",
    image: "/logos/cleaned/nic.png",
    sector: "Government",
    highlight: "Standards-compliant government portals built with public-sector rigor.",
  },
  {
    name: "Nirmala Convent",
    slug: "nirmala-convent",
    image: "/logos/cleaned/nirmala-convent.png",
    sector: "Education",
    imageScale: 1.08,
    highlight: "School communication platforms for announcements and community engagement.",
  },
  {
    name: "Soorya Hospitals",
    slug: "soorya-hospitals",
    image: "/logos/cleaned/soorya-hospitals.png",
    sector: "Enterprise",
    highlight: "Patient-friendly hospital sites with service and enquiry workflows.",
  },
  {
    name: "St. Ann's School",
    slug: "st-anns-school",
    image: "/logos/cleaned/st-anns-school.png",
    sector: "Education",
    highlight: "School portals for admissions, information sharing, and parent interaction.",
  },
  {
    name: "St. John's",
    slug: "st-johns",
    image: "/logos/cleaned/st-johns.png",
    sector: "Education",
    highlight: "Campus websites designed for rich content and ease of use.",
  },
  {
    name: "Telangana Bhatraju",
    slug: "telangana-bhatraju",
    image: "/logos/cleaned/telangana-bhatraju.png",
    sector: "Education",
    imageScale: 1.2,
    highlight: "Community platforms promoting social and cultural programs online.",
  },
  {
    name: "Telugu Film Chamber",
    slug: "telugu-film-chamber",
    image: "/logos/cleaned/telugu-film-chamber.png",
    sector: "Enterprise",
    imageScale: 1.8,
    highlight: "Industry portals enabling communication and digital coordination.",
  },
  {
    name: "TTD",
    slug: "ttd",
    image: "/logos/cleaned/ttd.png",
    sector: "Government",
    imageScale: 1.12,
    highlight: "High-traffic pilgrimage portals handling services, bookings, and information.",
  },
];

export const clientLogoRows = [
  clientLogos.filter((_, index) => index % 2 === 0),
  clientLogos.filter((_, index) => index % 2 === 1),
];
