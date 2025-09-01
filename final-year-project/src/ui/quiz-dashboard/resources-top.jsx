"use client";

const ResourcesTopPage = ({ objectives }) => {
  return (
    <section className="p-5 space-y-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-2xl font-semibold">Official Exam Objectives</h2>
        <a
          href="/dashboard/practice"
          className="text-sm text-muted-foreground hover:underline"
        >
          View All
        </a>
      </div>
      <div className="grid md:grid-cols-3 gap-x-5 gap-y-10 mt-10">
        {objectives.slice(0, 3).map((obj) => (
          <a
            key={obj.id}
            href={obj.target_url || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="group border border-border rounded-xl overflow-hidden flex flex-col transition-colors duration-300 hover:bg-muted"
          >
            <div className="relative w-full aspect-video overflow-hidden">
              <img
                src={obj.image}
                alt={obj.title}
                className="w-full h-full object-contain p-4 transition-transform duration-300 group-hover:scale-105"
              />
            </div>

            <div className="p-6 space-y-2 flex-1 flex flex-col justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Official Objective
                </p>
                <h3 className="text-lg font-semibold">{obj.title}</h3>
                <p className="text-sm text-muted-foreground py-2">
                  {obj.description}
                </p>
              </div>

              <div className="text-sm text-muted-foreground pt-2 font-bold">
                Certification: {obj.certificationName}
              </div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
};

export default ResourcesTopPage;
