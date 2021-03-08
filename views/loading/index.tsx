import Button from "../../components/inputs/button";
import Spinner from "../../components/spinner";

type Props = {
  restartCallback?: () => void;
};

export default function LoadingView({ restartCallback }: Props) {
  return (
    <main className="min-h-screen flex flex-col p-8">
      <div className="flex-1 flex items-center justify-center">
        <Spinner />
      </div>

      {typeof restartCallback === "function" && (
        <Button small onClick={restartCallback}>
          Restart Mini
        </Button>
      )}
    </main>
  );
}
