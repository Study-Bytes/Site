import ErrorStatusPage from "./ErrorStatusPage";

export default function AccessDeniedPage() {
    return <ErrorStatusPage status={403} />;
}
