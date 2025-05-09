import { title, subtitle } from "@/components/primitives";
import { Card, CardBody, CardHeader, CardFooter } from "@heroui/card";
import { Divider } from "@heroui/divider";
import { Button } from "@heroui/button";
import { Progress } from "@heroui/progress";
import { 
  TrendingUpIcon, 
  UserPlusIcon, 
  ShoppingCartIcon, 
  DollarSignIcon 
} from "lucide-react";

export default function DashboardPage() {
  // Sample statistics data
  const stats = [
    {
      title: "Total Revenue",
      value: "$24,423",
      change: "+12.5%",
      icon: <DollarSignIcon className="text-primary" />,
      positive: true,
    },
    {
      title: "New Customers",
      value: "2,149",
      change: "+18.2%",
      icon: <UserPlusIcon className="text-success" />,
      positive: true,
    },
    {
      title: "Active Projects",
      value: "42",
      change: "+8.1%",
      icon: <TrendingUpIcon className="text-warning" />,
      positive: true,
    },
    {
      title: "Pending Orders",
      value: "12",
      change: "-2.4%",
      icon: <ShoppingCartIcon className="text-danger" />,
      positive: false,
    },
  ];

  // Sample projects data
  const projects = [
    {
      name: "Website Redesign",
      progress: 75,
      status: "In Progress",
    },
    {
      name: "Mobile App Development",
      progress: 32,
      status: "In Progress",
    },
    {
      name: "Marketing Campaign",
      progress: 100,
      status: "Completed",
    },
    {
      name: "Database Migration",
      progress: 58,
      status: "In Progress",
    },
  ];

  return (
    < >
      <div className="flex flex-col gap-2">
        <h3 className='text-3xl font-semibold'>Dashboard</h3>
        <p className="text-default-500">Welcome back! Here's an overview of your progress today.</p>
      </div>


   
    </>
  );
}