"use client";

import useSWR from "swr";
import Image from "next/image";
import { useParams } from "next/navigation";

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function CoachPage() {
  const { coachId } = useParams();
  const { data, error, isLoading } = useSWR(
    coachId ? `/api/coaches/${coachId}` : null,
    fetcher
  );

  if (isLoading) {
    return (
      <div className="coachPage">
        <div className="coachPage__heroSkeleton" />
        <div className="coachPage__careerSkeleton" />
      </div>
    );
  }

  if (error || data?.error) {
    return (
      <div className="coachPage">
        <div className="coachPage__empty">Couldn't load this coach's profile.</div>
      </div>
    );
  }

  const coach = data?.coach;
  if (!coach) return null;

  const fullName =
    coach.name || `${coach.firstname || ""} ${coach.lastname || ""}`.trim();

  return (
    <div className="coachPage">
      <div className="coachPage__hero">
        <div className="coachPage__heroPhotoWrap">
          <Image
            src={coach.photo}
            alt={fullName}
            width={110}
            height={110}
            className="coachPage__heroPhoto"
          />
        </div>

        <div className="coachPage__heroInfo">
          <h1 className="coachPage__heroName">{fullName}</h1>

          <div className="coachPage__heroMeta">
            {coach.age != null && (
              <span className="coachPage__metaPill">{coach.age} yrs</span>
            )}
            {coach.nationality && (
              <span className="coachPage__metaPill">{coach.nationality}</span>
            )}
            {coach.height && (
              <span className="coachPage__metaPill">{coach.height}</span>
            )}
            {coach.birth?.date && (
              <span className="coachPage__metaPill">Born {coach.birth.date}</span>
            )}
          </div>

          {coach.team?.name && (
            <div className="coachPage__currentTeam">
              {coach.team.logo && (
                <Image
                  src={coach.team.logo}
                  alt={coach.team.name}
                  width={22}
                  height={22}
                />
              )}
              <span>Currently coaching {coach.team.name}</span>
            </div>
          )}
        </div>
      </div>

      <div className="coachPage__career">
        <h2 className="coachPage__sectionTitle">Career</h2>

        {(!coach.career || coach.career.length === 0) && (
          <div className="coachPage__empty">No career history available.</div>
        )}

        <div className="coachPage__careerList">
          {coach.career?.map((stint, i) => (
            <div className="coachPage__careerRow" key={`${stint.team?.id}-${i}`}>
              <div className="coachPage__careerTeam">
                {stint.team?.logo && (
                  <Image
                    src={stint.team.logo}
                    alt={stint.team?.name || ""}
                    width={28}
                    height={28}
                  />
                )}
                <span>{stint.team?.name || "Unknown team"}</span>
              </div>
              <span className="coachPage__careerDates">
                {stint.start} — {stint.end || "Present"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}