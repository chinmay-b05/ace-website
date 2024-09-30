/// <reference path="../.astro/types.d.ts" />
declare namespace App {
  interface Locals {
    email: string | null | undefined;
    name: string | null | undefined;
    role: string | null | undefined;
    id: string | null | undefined;
  }
}
interface Window {
  gsap: typeof import('gsap').gsap;
  ScrollTrigger: typeof import('gsap/ScrollTrigger').ScrollTrigger;
  gsapContext: ReturnType<typeof import('gsap').gsap.context>;
}
