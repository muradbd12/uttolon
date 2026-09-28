import BookDetail from "@/components/BookDetail";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function BookDetailPage({ params }: Props) {
  const { id } = await params;
  return (
    <section className="bg-paper-raised">
      <div className="mx-auto max-w-4xl px-5 py-14 sm:px-8 sm:py-20">
        <BookDetail id={id} />
      </div>
    </section>
  );
}
