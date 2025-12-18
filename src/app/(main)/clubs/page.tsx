import { getUserProfile } from "@/actions/auth";
import Image from "next/image";
import { Header } from "@/components/header";
import { MobilePageWrapper } from "@/components/mobile-page-wrapper";
import { Card, CardContent } from "@/components/ui/card";
import { MovieInfoDialog } from "@/components/movie-info-dialog";
import { FilmIcon } from "lucide-react";

const CLUBS = [
  {
    id: 1,
    name: "Navajo Movie Talkers",
    image: "",
    description: "All genres and all opinions welcome",
    members: ["123", "123", "123", "123"],
    movies: [
      {
        id: "c398a41c-da1e-4aa7-b4f2-e2af92f43501",
        tmdb_id: 11873,
        title: "The Color of Money",
        year: 1986,
        poster_url:
          "https://image.tmdb.org/t/p/w342/dVdnHmdQu3JtLAAksjTmTEF76gD.jpg",
        description:
          'Former pool hustler "Fast Eddie" Felson decides he wants to return to the game by taking a pupil. He meets talented but green Vincent Lauria and proposes a partnership. As they tour pool halls, Eddie teaches Vincent the tricks of scamming, but he eventually grows frustrated with Vincent\'s showboat antics, leading to an argument and a falling-out. Eddie takes up playing again and soon crosses paths with Vincent as an opponent.',
        added_by: "afdfff5a-2928-47d2-ab7e-9eb8eba6ed88",
        created_at: "2025-12-18T01:41:57.503328+00:00",
        is_current: true,
      },
      {
        id: "8cbab2af-a5b1-46c6-bf30-7c1d49925afb",
        tmdb_id: 758323,
        title: "The Pope's Exorcist",
        year: 2023,
        poster_url:
          "https://image.tmdb.org/t/p/w342/jFC4LS5qTAT3PinzdEzINfu1CV9.jpg",
        description:
          "Father Gabriele Amorth, Chief Exorcist of the Vatican, investigates a young boy's terrifying possession and ends up uncovering a centuries-old conspiracy the Vatican has desperately tried to keep hidden.",
        added_by: "afdfff5a-2928-47d2-ab7e-9eb8eba6ed88",
        created_at: "2025-12-18T03:37:42.153148+00:00",
        is_current: false,
      },
      {
        id: "994cc001-841b-4cd0-9a64-bc831d8891a0",
        tmdb_id: 120,
        title: "The Lord of the Rings: The Fellowship of the Ring",
        year: 2001,
        poster_url:
          "https://image.tmdb.org/t/p/w342/6oom5QYQ2yQTMJIbnvbkBL9cHo6.jpg",
        description:
          "Young hobbit Frodo Baggins, after inheriting a mysterious ring from his uncle Bilbo, must leave his home in order to keep it from falling into the hands of its evil creator. Along the way, a fellowship is formed to protect the ringbearer and make sure that the ring arrives at its final destination: Mt. Doom, the only place where it can be destroyed.",
        added_by: "e8549203-0f96-4d5f-955b-a201f2edc210",
        created_at: "2025-12-18T03:30:39.421102+00:00",
        is_current: false,
      },
      {
        id: "f34be762-9c49-405b-a039-fd2ffa6b811f",
        tmdb_id: 1495,
        title: "Kingdom of Heaven",
        year: 2005,
        poster_url:
          "https://image.tmdb.org/t/p/w342/rNaBe4TwbMef71sgscqabpGKsxh.jpg",
        description:
          "After his wife dies, a blacksmith named Balian is thrust into royalty, political intrigue and bloody holy wars during the Crusades.",
        added_by: "e8549203-0f96-4d5f-955b-a201f2edc210",
        created_at: "2025-12-18T03:29:46.326868+00:00",
        is_current: false,
      },
      {
        id: "188d1690-be46-4f58-8b89-bc6b1373d645",
        tmdb_id: 10673,
        title: "Wall Street",
        year: 1987,
        poster_url:
          "https://image.tmdb.org/t/p/w342/2tQYq9ntzn2dEwDIGLBSipYPenv.jpg",
        description:
          "A young and impatient stockbroker is willing to do anything to get to the top, including trading on illegal inside information taken through a ruthless and greedy corporate raider, whom takes the youth under his wing.",
        added_by: "afdfff5a-2928-47d2-ab7e-9eb8eba6ed88",
        created_at: "2025-12-18T02:47:59.681467+00:00",
        is_current: false,
      },
      {
        id: "241f779e-ad06-4e8c-870a-385da4c42d09",
        tmdb_id: 46705,
        title: "Blue Valentine",
        year: 2010,
        poster_url:
          "https://image.tmdb.org/t/p/w342/dc8BdKnDY5Iy28KzUGtHIXuqqFK.jpg",
        description:
          "Dean and Cindy live a quiet life in a modest neighborhood. They appear to have the world at their feet at the outset of the relationship. However, his lack of ambition and her retreat into self-absorption cause potentially irreversible cracks in their marriage.",
        added_by: "afdfff5a-2928-47d2-ab7e-9eb8eba6ed88",
        created_at: "2025-12-18T02:45:00.795542+00:00",
        is_current: false,
      },
      {
        id: "9e8693bb-c0ff-4aae-abf7-1116d882ee19",
        tmdb_id: 13960,
        title: "ATL",
        year: 2006,
        poster_url:
          "https://image.tmdb.org/t/p/w342/wi9VRukGburXfDwDKqcQQdgFK5S.jpg",
        description:
          "As four friends prepare for life after high school, different challenges bring about turning points in each of their lives. The dramas unfold and resolve at their local rollerskating rink, Cascade.",
        added_by: "afdfff5a-2928-47d2-ab7e-9eb8eba6ed88",
        created_at: "2025-12-18T02:44:35.05041+00:00",
        is_current: false,
      },
    ],
  },
];

export default async function ClubsPage() {
  const { profile } = await getUserProfile();

  return (
    <div className="min-h-screen bg-zinc-950">
      <Header profile={profile} />
      <MobilePageWrapper>
        {CLUBS.map((club) => (
          <Card key={club.id} className={`m-2 mx-auto max-w-[900px]`}>
            <CardContent>
              <div className="flex gap-4 overflow-hidden">
                <Image
                  src="/logo.png"
                  alt="Navajo Movie Talkers Logo"
                  width={80}
                  height={80}
                  className="h-20 w-20 rounded-full"
                />
                <div className="flex flex-col w-full">
                  <div className={`flex gap-2 items-center`}>
                    <h1 className="text-xl font-bold">{club.name}</h1>
                    <span className={`text-sm text-amber-500/90`}>
                      ({club.members.length}{" "}
                      {club.members.length > 1 ? "members" : "member"})
                    </span>
                  </div>
                  <div>{club.description}</div>
                  <div className="flex w-full overflow-x-auto">
                    {club.movies.map((movie) => (
                      <MovieInfoDialog key={movie.id} movie={movie}>
                        {movie.poster_url ? (
                          <button className="relative m-2 h-35 w-25 flex-shrink-0 overflow-hidden rounded-md bg-zinc-800 hover:ring-2 hover:ring-amber-500/50 transition-all cursor-pointer">
                            <Image
                              src={movie.poster_url}
                              alt={movie.title}
                              fill
                              className="object-cover"
                              sizes="200px"
                            />
                          </button>
                        ) : (
                          <button className="flex h-20 w-14 flex-shrink-0 items-center justify-center rounded-md bg-zinc-800 hover:ring-2 hover:ring-amber-500/50 transition-all cursor-pointer">
                            <FilmIcon className="h-6 w-6 text-zinc-600" />
                          </button>
                        )}
                      </MovieInfoDialog>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </MobilePageWrapper>
    </div>
  );
}
