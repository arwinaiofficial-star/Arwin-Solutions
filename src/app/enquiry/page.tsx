import { redirect } from "next/navigation";

// The enquiry form has been unified into Arwin Connect at /contact
// This redirect ensures all existing links and bookmarks continue to work
export default function EnquiryPage() {
  redirect("/contact?intent=project");
}
