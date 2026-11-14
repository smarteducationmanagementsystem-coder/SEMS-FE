import { redirect } from "next/navigation";
import { routes } from "@/constants/routes";

export default function FeaturesRedirect() {
  redirect(routes.service);
}
