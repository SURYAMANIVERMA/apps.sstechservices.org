import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Ticket, ArrowLeft, Plus, Send } from "lucide-react";

export const Route = createFileRoute("/_authenticated/tickets")({
  head: () => ({ meta: [{ title: "Support Tickets — SSTECH NEXEUS" }, { name: "robots", content: "noindex" }] }),
  component: TicketsPage,
});

type Ticket = {
  id: string; subject: string; category: string; priority: string; status: string;
  last_activity_at: string; created_at: string; owner_id: string;
};
type Reply = { id: string; body: string; is_staff: boolean; created_at: string; author_id: string };

function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selected, setSelected] = useState<Ticket | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [priority, setPriority] = useState("normal");
  const [reply, setReply] = useState("");

  async function load() {
    const { data } = await supabase.from("support_tickets").select("*").order("last_activity_at", { ascending: false });
    setTickets((data as Ticket[]) ?? []);
  }
  async function loadReplies(id: string) {
    const { data } = await supabase.from("ticket_replies").select("*").eq("ticket_id", id).order("created_at");
    setReplies((data as Reply[]) ?? []);
  }
  useEffect(() => { void load(); }, []);
  useEffect(() => { if (selected) void loadReplies(selected.id); }, [selected]);

  async function createTicket(e: React.FormEvent) {
    e.preventDefault();
    if (!subject.trim() || !body.trim()) return;
    const uid = (await supabase.auth.getUser()).data.user!.id;
    const { data: t, error } = await supabase.from("support_tickets")
      .insert({ owner_id: uid, subject: subject.trim(), priority, category: "general" })
      .select().single();
    if (error || !t) return toast.error(error?.message || "Failed");
    await supabase.from("ticket_replies").insert({ ticket_id: t.id, author_id: uid, body: body.trim(), is_staff: false });
    toast.success("Ticket created");
    setSubject(""); setBody("");
    void load();
  }

  async function sendReply() {
    if (!selected || !reply.trim()) return;
    const uid = (await supabase.auth.getUser()).data.user!.id;
    const { error } = await supabase.from("ticket_replies").insert({
      ticket_id: selected.id, author_id: uid, body: reply.trim(), is_staff: false,
    });
    if (error) return toast.error(error.message);
    await supabase.from("support_tickets").update({ last_activity_at: new Date().toISOString() }).eq("id", selected.id);
    setReply("");
    void loadReplies(selected.id);
  }

  return (
    <div className="min-h-screen text-white">
      <header className="border-b border-white/10 bg-black/40 backdrop-blur sticky top-0 z-30">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-6 py-4">
          <Link to="/app" className="flex items-center gap-2 text-white/70 hover:text-white text-sm">
            <ArrowLeft className="h-4 w-4" /> Back to dashboard
          </Link>
          <div className="text-xs text-white/50">Support Tickets</div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10 space-y-8">
        <h1 className="font-display text-3xl font-bold flex items-center gap-2"><Ticket className="h-7 w-7 text-emerald-400" /> Support Tickets</h1>

        <div className="grid gap-6 md:grid-cols-2">
          <section className="rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-transparent p-6">
            <h2 className="font-semibold mb-4">Open a new ticket</h2>
            <form onSubmit={createTicket} className="space-y-3">
              <Input placeholder="Subject" value={subject} onChange={(e)=>setSubject(e.target.value)}
                     className="bg-black/40 border-white/10 text-white" required />
              <select value={priority} onChange={(e)=>setPriority(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-md px-3 py-2 text-sm">
                <option value="low">Low</option><option value="normal">Normal</option>
                <option value="high">High</option><option value="urgent">Urgent</option>
              </select>
              <Textarea rows={5} placeholder="Describe your issue…" value={body} onChange={(e)=>setBody(e.target.value)}
                        className="bg-black/40 border-white/10 text-white" required />
              <Button type="submit" className="w-full bg-gradient-to-r from-emerald-500 to-blue-500">
                <Plus className="h-4 w-4 mr-1"/> Submit ticket
              </Button>
            </form>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-white/80 mb-4">Your tickets</h2>
            {tickets.length === 0 ? <p className="text-white/40 text-sm py-6 text-center">No tickets yet.</p> :
             <div className="divide-y divide-white/5">
               {tickets.map((t) => (
                 <button key={t.id} onClick={()=>setSelected(t)}
                         className={`w-full text-left py-3 px-2 rounded hover:bg-white/5 ${selected?.id===t.id?"bg-white/10":""}`}>
                   <div className="flex justify-between items-center">
                     <div className="font-medium text-sm">{t.subject}</div>
                     <span className="text-[10px] uppercase px-2 py-0.5 rounded-full bg-white/10 text-white/70">{t.status}</span>
                   </div>
                   <div className="text-xs text-white/50 mt-1">{t.priority} · {new Date(t.last_activity_at).toLocaleString()}</div>
                 </button>
               ))}
             </div>}
          </section>
        </div>

        {selected && (
          <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h3 className="font-semibold mb-4">{selected.subject}</h3>
            <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
              {replies.map((r) => (
                <div key={r.id} className={`rounded-lg p-3 ${r.is_staff ? "bg-blue-500/10 border border-blue-500/30" : "bg-white/5"}`}>
                  <div className="text-[10px] uppercase text-white/40 mb-1">{r.is_staff ? "SS TECH Support" : "You"} · {new Date(r.created_at).toLocaleString()}</div>
                  <div className="text-sm whitespace-pre-wrap">{r.body}</div>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input value={reply} onChange={(e)=>setReply(e.target.value)} placeholder="Type reply…"
                     className="bg-black/40 border-white/10 text-white" />
              <Button onClick={sendReply}><Send className="h-4 w-4"/></Button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
