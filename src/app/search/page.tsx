import { redirect } from "next/navigation";

interface PageProps {
  searchParams: {
    [key: string]: string | string[] | undefined;
  };
}

const Page = ({ searchParams }: PageProps) => {
  const query = searchParams.query;

  if (!query || Array.isArray(query)) {
    return redirect("/");
  }

  // querying logic

  return <p>Hello</p>;
};

export default Page;
