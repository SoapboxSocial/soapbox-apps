import Spinner from "../../components/spinner";

export default function LoadingView() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center">
      <Spinner />
    </main>
  );
}
