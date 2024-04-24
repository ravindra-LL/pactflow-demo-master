import path from "path";
import {
  PactV3,
  MatchersV3,
  SpecificationVersion,
} from "@pact-foundation/pact";
import { API } from "./api";

const { like } = MatchersV3;

const provider = new PactV3({
  consumer: "AjFrontendWebsite",
  provider: "AjApiService",
  log: path.resolve(process.cwd(), "logs", "pact.log"),
  logLevel: "warn",
  dir: path.resolve(process.cwd(), "pacts"),
  spec: SpecificationVersion.SPECIFICATION_VERSION_V2,
});

describe("API Pact test", () => {
  describe("Getting Breaking News", () => {
    test("Breaking News Exists", async () => {
      await provider.addInteraction({
        states: [{ description: "Breaking News Exists" }],
        uponReceiving: "Get All Breaking News",
        withRequest: {
          method: "GET",
          path: "/graphql",
          query: {
            "wp-site": "aje",
            operationName: "ArchipelagoBreakingTickerQuery",
            variables: "%7B%7D",
            extensions: "%7B%7D",
          },
        },
        willRespondWith: {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
          body: {
            data: {
              breakingNews: {
                post: like("2840262"),
                tickerTitle: like("breaking"),
                tickerText: like([
                  "New topics",
                  "New breaking news",
                  "New update",
                ]),
                modified: like("2024-04-23 08:25:30"),
                link: like(
                  "/news/2024/4/21/mass-grave-with-50-bodies-found-in-khan-younis-hlstyleguide-2"
                ),
                __typename: like("BreakingNews"),
              },
            },
          },
        },
      });

      await provider.executeTest(async (mockService) => {
        const api = new API(mockService.url);

        // make request to Pact mock server
        const news = await api.getGQL({
          "wp-site": "aje",
          operationName: "ArchipelagoBreakingTickerQuery",
          variables: "%7B%7D",
          extensions: "%7B%7D",
        });

        expect(news).toStrictEqual({
          data: {
            breakingNews: {
              post: "2840262",
              tickerTitle: "breaking",
              tickerText: ["New topics", "New breaking news", "New update"],
              modified: "2024-04-23 08:25:30",
              link: "/news/2024/4/21/mass-grave-with-50-bodies-found-in-khan-younis-hlstyleguide-2",
              __typename: "BreakingNews",
            },
          },
        });
      });
    });
  });
});
