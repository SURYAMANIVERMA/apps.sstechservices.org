import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Users, Video, ClipboardCheck, CalendarCheck, FileText } from "lucide-react";

export default function TrainerDashboard() {
  const stats = [
    { title: "Assigned Courses", value: "5", icon: BookOpen },
    { title: "Total Students", value: "142", icon: Users },
    { title: "Uploaded Videos", value: "37", icon: Video },
    { title: "Assignments", value: "12", icon: ClipboardCheck },
  ];

  return (
    <div className="container mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold mb-2">Trainer Dashboard</h1>
      <p className="text-gray-500 mb-8">Manage your courses, students and learning content.</p>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-5 mb-8">
        {stats.map((item) => (
          <Card key={item.title} className="p-5">
            <item.icon className="h-8 w-8 mb-3" />
            <h2 className="text-lg font-semibold">{item.title}</h2>
            <p className="text-2xl font-bold mt-2">{item.value}</p>
          </Card>
        ))}
      </div>

      {/* Actions */}
      <div className="grid md:grid-cols-3 gap-5">

        <Card className="p-6">
          <Video className="h-8 w-8 mb-3" />
          <h2 className="font-bold text-lg">Upload Video Lectures</h2>
          <p className="text-sm text-gray-500 mt-2">
            Upload recorded course lectures for students.
          </p>
          <Button className="mt-4">Upload Video</Button>
        </Card>

        <Card className="p-6">
          <FileText className="h-8 w-8 mb-3" />
          <h2 className="font-bold text-lg">Create Quiz</h2>
          <p className="text-sm text-gray-500 mt-2">
            Create module wise quizzes for students.
          </p>
          <Button className="mt-4">Create Quiz</Button>
        </Card>

        <Card className="p-6">
          <ClipboardCheck className="h-8 w-8 mb-3" />
          <h2 className="font-bold text-lg">Assignments</h2>
          <p className="text-sm text-gray-500 mt-2">
            Review student assignments and grading.
          </p>
          <Button className="mt-4">Check Assignments</Button>
        </Card>

        <Card className="p-6">
          <CalendarCheck className="h-8 w-8 mb-3" />
          <h2 className="font-bold text-lg">Attendance</h2>
          <p className="text-sm text-gray-500 mt-2">
            Mark batch attendance for enrolled students.
          </p>
          <Button className="mt-4">Mark Attendance</Button>
        </Card>

        <Card className="p-6">
          <Users className="h-8 w-8 mb-3" />
          <h2 className="font-bold text-lg">Student List</h2>
          <p className="text-sm text-gray-500 mt-2">
            View all students assigned to your batches.
          </p>
          <Button className="mt-4">View Students</Button>
        </Card>

        <Card className="p-6">
          <BookOpen className="h-8 w-8 mb-3" />
          <h2 className="font-bold text-lg">Manage Courses</h2>
          <p className="text-sm text-gray-500 mt-2">
            Update course content and course materials.
          </p>
          <Button className="mt-4">Manage Courses</Button>
        </Card>

      </div>
    </div>
  );
}
