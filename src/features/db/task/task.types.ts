export type TaskData = {
  id: number;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  completed: boolean;
  createdAt: string;
  media: {
    id: number;
    type: "image" | "video";
    url: string;
  }[];
  employees: {
    id: string;
    fullName: string;
  }[];
  boss: {
    id: string;
    fullName: string;
  };
  project: {
    id: number;
    title: string;
  };
};
