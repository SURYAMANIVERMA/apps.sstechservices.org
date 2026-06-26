import { useState } from "react";
import PageHero from "@/components/PageHero";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";
import { BookOpen, Award, FileText, Video, ClipboardCheck, BarChart3, Users, Shield } from "lucide-react";

function LoginForm({ role }: { role: string }) {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  return (
    <form
      onSubmit={e => { e.preventDefault(); if (!email || !pw) return toast({ title: "Enter credentials" }); toast({ title: `${role} login`, description: "LMS backend is not yet connected. Enable Lovable Cloud to activate real authentication." }); }}
      className="grid gap-4"
    >
      <div><Label>Email / Student ID</Label><Input value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" /></div>
      <div><Label>Password</Label><Input type="password" value={pw} onChange={e=>setPw(e.target.value)} placeholder="••••••••" /></div>
      <Button type="submit" className="bg-gradient-accent border-0 shadow-accent">Sign in as {role}</Button>
      <p className="text-xs text-muted-foreground text-center">Forgot password? Contact your batch coordinator.</p>
    </form>
  );
}

export default function LMS() {
  const features = [
    { icon: BookOpen, title: "Course Catalog", text: "Browse 30+ programs with structured learning paths." },
    { icon: Video, title: "Video Lessons", text: "HD recorded lectures & live class playback." },
    { icon: ClipboardCheck, title: "Assignments", text: "Submit, get feedback and track grades." },
    { icon: FileText, title: "Quizzes", text: "Auto-graded quizzes after every module." },
    { icon: BarChart3, title: "Progress Tracking", text: "Real-time dashboards for each course." },
    { icon: Award, title: "Certificates", text: "Download verifiable completion certificates." },
  ];
  return (
    <>
      <PageHero eyebrow="LMS Portal" title={<>Your learning, <span className="text-accent">organised.</span></>} sub="One portal for courses, videos, assignments, quizzes, certificates and progress — for students, trainers and administrators." />

      <section className="section-py container mx-auto container-px grid lg:grid-cols-2 gap-10 items-start">
        <div className="grid sm:grid-cols-2 gap-4">
          {features.map(f => (
            <Card key={f.title} className="p-5 border-border hover:shadow-elegant transition">
              <f.icon className="h-7 w-7 text-accent mb-3" />
              <h3 className="font-display font-bold text-primary">{f.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{f.text}</p>
            </Card>
          ))}
        </div>
        <Card className="p-7 shadow-elegant">
          <h2 className="font-display text-2xl font-bold text-primary mb-1">Sign in to LMS</h2>
          <p className="text-sm text-muted-foreground mb-5">Choose your role</p>
          <Tabs defaultValue="student">
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="student"><Users className="h-4 w-4 mr-1.5"/>Student</TabsTrigger>
              <TabsTrigger value="trainer"><BookOpen className="h-4 w-4 mr-1.5"/>Trainer</TabsTrigger>
              <TabsTrigger value="admin"><Shield className="h-4 w-4 mr-1.5"/>Admin</TabsTrigger>
            </TabsList>
            <TabsContent value="student" className="pt-5"><LoginForm role="Student" /></TabsContent>
            <TabsContent value="trainer" className="pt-5"><LoginForm role="Trainer" /></TabsContent>
            <TabsContent value="admin" className="pt-5"><LoginForm role="Admin" /></TabsContent>
          </Tabs>
        </Card>
      </section>

      <section className="section-py bg-secondary/40 border-y border-border">
        <div className="container mx-auto container-px">
          <h2 className="font-display text-3xl font-bold text-primary mb-2">Student dashboard preview</h2>
          <p className="text-muted-foreground mb-8">A glimpse of what learners see after sign-in.</p>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { name: "SOC Analyst Bootcamp", p: 78 },
              { name: "AWS Solutions Architect", p: 45 },
              { name: "Full Stack Development", p: 22 },
            ].map(c => (
              <Card key={c.name} className="p-5 border-border">
                <div className="text-xs text-accent font-semibold mb-1">IN PROGRESS</div>
                <h3 className="font-display font-bold text-primary mb-3">{c.name}</h3>
                <Progress value={c.p} className="h-2" />
                <div className="text-xs text-muted-foreground mt-2">{c.p}% complete</div>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}