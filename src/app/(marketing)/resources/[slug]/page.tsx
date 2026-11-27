import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { posts } from "@/lib/content";
import { formatDate } from "@/lib/utils";
import { Avatar } from "@/components/ui/misc";
import { FinalCTA } from "@/components/marketing/cta";

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = posts.find((p) => p.slug === slug);
  if (!post) return {};
  return { title: post.title, description: post.excerpt, openGraph: { type: "article", title: post.title, description: post.excerpt } };
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = posts.find((p) => p.slug === slug);
  if (!post) notFound();
  const related = posts.filter((p) => p.slug !== slug).slice(0, 3);
  return (
    <>
      <article className="container max-w-3xl pb-16 pt-32 sm:pt-40">
        <Link href="/resources" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white"><ArrowLeft className="size-4" /> All resources</Link>
        <p className="mt-8 text-sm font-medium text-blue-300">{post.category}</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white sm:text-5xl">{post.title}</h1>
        <div className="mt-6 flex items-center gap-3 text-sm text-slate-400">
          <Avatar name={post.author} size={36} className="ring-[#081426]" />
          <span><span className="text-white">{post.author}</span> · {formatDate(post.date)} · {post.read}</span>
        </div>
        <div className="mt-10 space-y-6 text-[17px] leading-[1.75] text-slate-300">
          <p className="text-xl leading-relaxed text-slate-200">{post.excerpt}</p>
          <h2 className="pt-4 text-2xl font-semibold text-white">Start with what you can measure today</h2>
          <p>Most operations already have the raw data: attendance exports, payroll registers, client contracts and invoice history. The problem is that each lives in a different tool, defined slightly differently. Before building a model, agree on a single definition for each input and the system of record it comes from.</p>
          <h2 className="pt-4 text-2xl font-semibold text-white">Build the model in three layers</h2>
          <ol className="list-decimal space-y-2 pl-6">
            <li><strong className="text-white">Direct cost:</strong> salary, overtime, bonuses and statutory contributions for the agents on the account.</li>
            <li><strong className="text-white">Shared cost:</strong> supervisors, QA, workforce management and facilities, allocated by seat or by hours.</li>
            <li><strong className="text-white">Hidden cost:</strong> attrition and retraining, idle time between campaigns, and unbilled ramp-up weeks.</li>
          </ol>
          <h2 className="pt-4 text-2xl font-semibold text-white">Review it monthly, not annually</h2>
          <p>Margins in outsourcing move with every roster change. When attendance, payroll and invoicing share one data model, the review takes minutes instead of a week, and you can act while the month is still open.</p>
          <blockquote className="border-l-2 border-blue-400 pl-5 italic text-slate-200">“The accounts that looked busiest were often the ones losing us money. We only saw it once payroll and billing were in the same place.”</blockquote>
        </div>
      </article>
      <section className="container max-w-5xl pb-8" aria-labelledby="rel">
        <h2 id="rel" className="text-xl font-semibold text-white">Keep reading</h2>
        <ul className="mt-6 grid gap-4 sm:grid-cols-3">
          {related.map((p) => (
            <li key={p.slug}><Link href={`/resources/${p.slug}`} className="block h-full rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5 hover:border-white/15"><p className="text-xs text-blue-300">{p.category}</p><p className="mt-2 font-medium leading-snug text-white">{p.title}</p></Link></li>
          ))}
        </ul>
      </section>
      <FinalCTA />
    </>
  );
}
