import ThreadView from "@/ui/forum/thread-view";

export default function ThreadPage({ params }) {
    return <ThreadView threadId={params.id} />;
}