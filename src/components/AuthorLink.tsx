import { Link } from "react-router-dom";

export default function AuthorLink({ id, name }: { id?: string; name: string }) {
  if (!id) return <span>{name}</span>;
  return (
    <Link to={`/u/${id}`} className="author-link">
      {name}
    </Link>
  );
}
