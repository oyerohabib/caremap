import { TRPCError } from "@trpc/server";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TenantProvider } from "@/components/tenant-context";
import { TenantHeader } from "@/components/tenant-header";
import { brandRootCss, safeBrandColors } from "@/lib/brand";
import { TRPCReactProvider } from "@/trpc/client";
import { serverCaller } from "@/trpc/server";

async function loadTenant(slug: string) {
  try {
    return await (await serverCaller()).tenant.bySlug({ slug });
  } catch (error) {
    if (error instanceof TRPCError && error.code === "NOT_FOUND") notFound();
    throw error;
  }
}

export async function generateMetadata({ params }: LayoutProps<"/t/[tenant]">): Promise<Metadata> {
  const tenant = await loadTenant((await params).tenant);
  return { title: { default: tenant.name, template: `%s · ${tenant.name}` } };
}

export default async function TenantLayout({ children, params }: LayoutProps<"/t/[tenant]">) {
  const tenant = await loadTenant((await params).tenant);
  const colors = safeBrandColors({ primary: tenant.primaryColor, accent: tenant.accentColor });

  return (
    <div data-tenant={tenant.slug} className="flex flex-1 flex-col">
      <style dangerouslySetInnerHTML={{ __html: brandRootCss(colors) }} />
      <TenantProvider tenant={{ slug: tenant.slug, name: tenant.name }} colors={colors}>
        <TRPCReactProvider tenantSlug={tenant.slug}>
          <TenantHeader />
          {children}
        </TRPCReactProvider>
      </TenantProvider>
    </div>
  );
}
