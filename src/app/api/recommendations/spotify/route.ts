import OpenAI from "openai";
import {
	constructGPTPrompt,
	parseResponse,
  filterSpotifyResponses
} from "@/utils/helpers";
import { GPT_SYSTEM_PROMPT } from "@/utils/constants";
import { auth } from "@/auth";
import { type NextRequest } from "next/server";

 const openAI = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
}); 

export async function GET(request: NextRequest){
  const session = await auth();

  if(!session?.user || !session?.access_token){
    return new Response(null, { status: 401}) //User is not authenticated
  }

  //Extract user prompt and pass to OpenAI
const searchParams = request.nextUrl.searchParams
const query = searchParams.get('query')
  const prompt = constructGPTPrompt(query);
	console.log("🔍 PROMPT: ", prompt); //TESTING - REMOVE BEFORE Push

  try {
		//Get ChatGPT to give us back a list of artists and genres
		const chatCompletion = await openAI.chat.completions.create({
			messages: [
        {role: "system", content: GPT_SYSTEM_PROMPT},
        { role: "user", content: prompt }
      ],
			model: "gpt-4o-mini",
			frequency_penalty: 1,
			presence_penalty: 1,
			temperature: 1,
			max_tokens: 1500,
			n: 1,
      tools:[
        {
          "type": "function",
          "function": {
            "name": "get_music_recommendations",
            "description": "Get playlist recommendations based on the user prompt. There is a minimum of 12 songs that get returned back.",
            "parameters": {
              "type": "object",
              "properties": {
                "recommendations": {
                  "description": "An array of objects containing a list of artists and songs that align with the users prompt.",
                "type": "array",
                "items": {
                "type": "object",
                "properties": {
                  "artist": {
                    "type": "string",
                    "description": "The artist of the song that is being recommended."
                  },
                  "song": {
                    "type": "string",
                    "description": "The song from the artist that is being recommended."
                  }
                },
                "required": ["artist", "song"]
              }
            }
          },
          "required": ["recommendations"]
            }
          }
        }
      ], 
      tool_choice: "auto"
		});

		//const chatResponse = chatCompletion.choices[0].message.content ?? "";
    const chatResponse = chatCompletion.choices[0].message.tool_calls?.[0]?.function;
		//const artists = parseResponse(chatResponse).artists;

		console.log(chatResponse); //TESTING - REMOVE BEFORE Push
		console.log("------------");
    console.log("JSON.parse: ", JSON.parse(chatCompletion.choices[0].message.tool_calls?.[0]?.function?.arguments ?? ''));
//		console.log("JSON.parse: ", JSON.parse(chatResponse));		

		//TODO: Now I need to call Spotify's API's
	} catch (error) {
    console.log('🚨 ERROR: ', error);
    return Response.json({ error: "An error occurred while generating your playlist. Please try again.", status: 500})

	}




return Response.json(filterSpotifyResponses([
  {
    "tracks": {
      "href": "https://api.spotify.com/v1/search?query=track:Early+Autumn+artist:Stan+Getz&type=track&locale=en-US,en;q=0.9&offset=0&limit=2",
      "items": [
        {
          "album": {
            "images": [
              {
                "height": 640,
                "url": "https://i.scdn.co/image/ab67616d0000b2736e0104cb949d0a688ce47b38",
                "width": 640
              },
              {
                "height": 300,
                "url": "https://i.scdn.co/image/ab67616d00001e026e0104cb949d0a688ce47b38",
                "width": 300
              },
              {
                "height": 64,
                "url": "https://i.scdn.co/image/ab67616d000048516e0104cb949d0a688ce47b38",
                "width": 64
              }
            ],
            "name": "Cool Velvet: Stan Getz And Strings"
          },
          "artists": [
            {
              "name": "Stan Getz"
            }
          ],
          "uri": "spotify:track:22DysDIxio06fLuxT0f6g8",
          "name": "Early Autumn"
        }
      ],
      "limit": 2,
      "next": "https://api.spotify.com/v1/search?query=track:Early+Autumn+artist:Stan+Getz&type=track&locale=en-US,en;q=0.9&offset=2&limit=2",
      "offset": 0,
      "previous": null,
      "total": 10
    }
  },
  {
    "tracks": {
      "href": "https://api.spotify.com/v1/search?query=track:+bad+bad+news+artist:+leon+bridges&type=track&locale=en-US,en;q=0.9&offset=0&limit=1",
      "items": [
        {
          "album": {
            "album_type": "album",
            "artists": [
              {
                "external_urls": {
                  "spotify": "https://open.spotify.com/artist/3qnGvpP8Yth1AqSBMqON5x"
                },
                "href": "https://api.spotify.com/v1/artists/3qnGvpP8Yth1AqSBMqON5x",
                "id": "3qnGvpP8Yth1AqSBMqON5x",
                "name": "Leon Bridges",
                "type": "artist",
                "uri": "spotify:artist:3qnGvpP8Yth1AqSBMqON5x"
              }
            ],
            "available_markets": [
              "AR",
              "AU",
              "AT",
              "BE",
              "BO",
              "BR",
              "BG",
              "CA",
              "CL",
              "CO",
              "CR",
              "CY",
              "CZ",
              "DK",
              "DO",
              "DE",
              "EC",
              "EE",
              "SV",
              "FI",
              "FR",
              "GR",
              "GT",
              "HN",
              "HK",
              "HU",
              "IS",
              "IE",
              "IT",
              "LV",
              "LT",
              "LU",
              "MY",
              "MT",
              "MX",
              "NL",
              "NZ",
              "NI",
              "NO",
              "PA",
              "PY",
              "PE",
              "PH",
              "PL",
              "PT",
              "SG",
              "SK",
              "ES",
              "SE",
              "CH",
              "TW",
              "TR",
              "UY",
              "US",
              "GB",
              "AD",
              "LI",
              "MC",
              "ID",
              "JP",
              "TH",
              "VN",
              "RO",
              "IL",
              "ZA",
              "SA",
              "AE",
              "BH",
              "QA",
              "OM",
              "KW",
              "EG",
              "MA",
              "DZ",
              "TN",
              "LB",
              "JO",
              "PS",
              "IN",
              "BY",
              "KZ",
              "MD",
              "UA",
              "AL",
              "BA",
              "HR",
              "ME",
              "MK",
              "RS",
              "SI",
              "KR",
              "BD",
              "PK",
              "LK",
              "GH",
              "KE",
              "NG",
              "TZ",
              "UG",
              "AG",
              "AM",
              "BS",
              "BB",
              "BZ",
              "BT",
              "BW",
              "BF",
              "CV",
              "CW",
              "DM",
              "FJ",
              "GM",
              "GE",
              "GD",
              "GW",
              "GY",
              "HT",
              "JM",
              "KI",
              "LS",
              "LR",
              "MW",
              "MV",
              "ML",
              "MH",
              "FM",
              "NA",
              "NR",
              "NE",
              "PW",
              "PG",
              "PR",
              "WS",
              "SM",
              "ST",
              "SN",
              "SC",
              "SL",
              "SB",
              "KN",
              "LC",
              "VC",
              "SR",
              "TL",
              "TO",
              "TT",
              "TV",
              "VU",
              "AZ",
              "BN",
              "BI",
              "KH",
              "CM",
              "TD",
              "KM",
              "GQ",
              "SZ",
              "GA",
              "GN",
              "KG",
              "LA",
              "MO",
              "MR",
              "MN",
              "NP",
              "RW",
              "TG",
              "UZ",
              "ZW",
              "BJ",
              "MG",
              "MU",
              "MZ",
              "AO",
              "CI",
              "DJ",
              "ZM",
              "CD",
              "CG",
              "IQ",
              "LY",
              "TJ",
              "VE",
              "ET",
              "XK"
            ],
            "external_urls": {
              "spotify": "https://open.spotify.com/album/7J9fifadXb0PPSBWXctbi8"
            },
            "href": "https://api.spotify.com/v1/albums/7J9fifadXb0PPSBWXctbi8",
            "id": "7J9fifadXb0PPSBWXctbi8",
            "images": [
              {
                "height": 640,
                "url": "https://i.scdn.co/image/ab67616d0000b273a47ee7a49c53ccdcb38dc874",
                "width": 640
              },
              {
                "height": 300,
                "url": "https://i.scdn.co/image/ab67616d00001e02a47ee7a49c53ccdcb38dc874",
                "width": 300
              },
              {
                "height": 64,
                "url": "https://i.scdn.co/image/ab67616d00004851a47ee7a49c53ccdcb38dc874",
                "width": 64
              }
            ],
            "name": "Good Thing",
            "release_date": "2018-05-04",
            "release_date_precision": "day",
            "total_tracks": 10,
            "type": "album",
            "uri": "spotify:album:7J9fifadXb0PPSBWXctbi8"
          },
          "artists": [
            {
              "external_urls": {
                "spotify": "https://open.spotify.com/artist/3qnGvpP8Yth1AqSBMqON5x"
              },
              "href": "https://api.spotify.com/v1/artists/3qnGvpP8Yth1AqSBMqON5x",
              "id": "3qnGvpP8Yth1AqSBMqON5x",
              "name": "Leon Bridges",
              "type": "artist",
              "uri": "spotify:artist:3qnGvpP8Yth1AqSBMqON5x"
            }
          ],
          "available_markets": [
            "AR",
            "AU",
            "AT",
            "BE",
            "BO",
            "BR",
            "BG",
            "CA",
            "CL",
            "CO",
            "CR",
            "CY",
            "CZ",
            "DK",
            "DO",
            "DE",
            "EC",
            "EE",
            "SV",
            "FI",
            "FR",
            "GR",
            "GT",
            "HN",
            "HK",
            "HU",
            "IS",
            "IE",
            "IT",
            "LV",
            "LT",
            "LU",
            "MY",
            "MT",
            "MX",
            "NL",
            "NZ",
            "NI",
            "NO",
            "PA",
            "PY",
            "PE",
            "PH",
            "PL",
            "PT",
            "SG",
            "SK",
            "ES",
            "SE",
            "CH",
            "TW",
            "TR",
            "UY",
            "US",
            "GB",
            "AD",
            "LI",
            "MC",
            "ID",
            "JP",
            "TH",
            "VN",
            "RO",
            "IL",
            "ZA",
            "SA",
            "AE",
            "BH",
            "QA",
            "OM",
            "KW",
            "EG",
            "MA",
            "DZ",
            "TN",
            "LB",
            "JO",
            "PS",
            "IN",
            "BY",
            "KZ",
            "MD",
            "UA",
            "AL",
            "BA",
            "HR",
            "ME",
            "MK",
            "RS",
            "SI",
            "KR",
            "BD",
            "PK",
            "LK",
            "GH",
            "KE",
            "NG",
            "TZ",
            "UG",
            "AG",
            "AM",
            "BS",
            "BB",
            "BZ",
            "BT",
            "BW",
            "BF",
            "CV",
            "CW",
            "DM",
            "FJ",
            "GM",
            "GE",
            "GD",
            "GW",
            "GY",
            "HT",
            "JM",
            "KI",
            "LS",
            "LR",
            "MW",
            "MV",
            "ML",
            "MH",
            "FM",
            "NA",
            "NR",
            "NE",
            "PW",
            "PG",
            "PR",
            "WS",
            "SM",
            "ST",
            "SN",
            "SC",
            "SL",
            "SB",
            "KN",
            "LC",
            "VC",
            "SR",
            "TL",
            "TO",
            "TT",
            "TV",
            "VU",
            "AZ",
            "BN",
            "BI",
            "KH",
            "CM",
            "TD",
            "KM",
            "GQ",
            "SZ",
            "GA",
            "GN",
            "KG",
            "LA",
            "MO",
            "MR",
            "MN",
            "NP",
            "RW",
            "TG",
            "UZ",
            "ZW",
            "BJ",
            "MG",
            "MU",
            "MZ",
            "AO",
            "CI",
            "DJ",
            "ZM",
            "CD",
            "CG",
            "IQ",
            "LY",
            "TJ",
            "VE",
            "ET",
            "XK"
          ],
          "disc_number": 1,
          "duration_ms": 239306,
          "explicit": false,
          "external_ids": {
            "isrc": "USSM11708550"
          },
          "external_urls": {
            "spotify": "https://open.spotify.com/track/0EE12AftFfyxsSnMjoiIPB"
          },
          "href": "https://api.spotify.com/v1/tracks/0EE12AftFfyxsSnMjoiIPB",
          "id": "0EE12AftFfyxsSnMjoiIPB",
          "is_local": false,
          "name": "Bad Bad News",
          "popularity": 61,
          "preview_url": "https://p.scdn.co/mp3-preview/49d1d448bdf8d4c7b1e03ae41e947a0dc5107fcf?cid=d8a5ed958d274c2e8ee717e6a4b0971d",
          "track_number": 2,
          "type": "track",
          "uri": "spotify:track:0EE12AftFfyxsSnMjoiIPB"
        }
      ],
      "limit": 1,
      "next": "https://api.spotify.com/v1/search?query=track:+bad+bad+news+artist:+leon+bridges&type=track&locale=en-US,en;q=0.9&offset=1&limit=1",
      "offset": 0,
      "previous": null,
      "total": 3
    }
  },
  {
    "tracks": {
      "href": "https://api.spotify.com/v1/search?query=artist:+Adele+track:+Make+you+feel+my+love&type=track&locale=en-US,en;q=0.9&offset=0&limit=1",
      "items": [
        {
          "album": {
            "album_type": "album",
            "artists": [
              {
                "external_urls": {
                  "spotify": "https://open.spotify.com/artist/4dpARuHxo51G3z768sgnrY"
                },
                "href": "https://api.spotify.com/v1/artists/4dpARuHxo51G3z768sgnrY",
                "id": "4dpARuHxo51G3z768sgnrY",
                "name": "Adele",
                "type": "artist",
                "uri": "spotify:artist:4dpARuHxo51G3z768sgnrY"
              }
            ],
            "available_markets": [
              "AR",
              "BO",
              "BR",
              "BZ",
              "CL",
              "CO",
              "CR",
              "DO",
              "EC",
              "GT",
              "GY",
              "HN",
              "MX",
              "NI",
              "PA",
              "PE",
              "PR",
              "PY",
              "SR",
              "SV",
              "US",
              "UY",
              "VE"
            ],
            "external_urls": {
              "spotify": "https://open.spotify.com/album/59ULskOkBMij4zL8pS7mi0"
            },
            "href": "https://api.spotify.com/v1/albums/59ULskOkBMij4zL8pS7mi0",
            "id": "59ULskOkBMij4zL8pS7mi0",
            "images": [
              {
                "height": 640,
                "url": "https://i.scdn.co/image/ab67616d0000b273da737a3e194e3b9a46c1a6a3",
                "width": 640
              },
              {
                "height": 300,
                "url": "https://i.scdn.co/image/ab67616d00001e02da737a3e194e3b9a46c1a6a3",
                "width": 300
              },
              {
                "height": 64,
                "url": "https://i.scdn.co/image/ab67616d00004851da737a3e194e3b9a46c1a6a3",
                "width": 64
              }
            ],
            "name": "19",
            "release_date": "2008-01-28",
            "release_date_precision": "day",
            "total_tracks": 12,
            "type": "album",
            "uri": "spotify:album:59ULskOkBMij4zL8pS7mi0"
          },
          "artists": [
            {
              "external_urls": {
                "spotify": "https://open.spotify.com/artist/4dpARuHxo51G3z768sgnrY"
              },
              "href": "https://api.spotify.com/v1/artists/4dpARuHxo51G3z768sgnrY",
              "id": "4dpARuHxo51G3z768sgnrY",
              "name": "Adele",
              "type": "artist",
              "uri": "spotify:artist:4dpARuHxo51G3z768sgnrY"
            }
          ],
          "available_markets": [
            "AR",
            "BO",
            "BR",
            "BZ",
            "CL",
            "CO",
            "CR",
            "DO",
            "EC",
            "GT",
            "GY",
            "HN",
            "MX",
            "NI",
            "PA",
            "PE",
            "PR",
            "PY",
            "SR",
            "SV",
            "US",
            "UY",
            "VE"
          ],
          "disc_number": 1,
          "duration_ms": 212040,
          "explicit": false,
          "external_ids": {
            "isrc": "GBBKS0700586"
          },
          "external_urls": {
            "spotify": "https://open.spotify.com/track/5FgPwJ7Nh2FVmIXviKl2VF"
          },
          "href": "https://api.spotify.com/v1/tracks/5FgPwJ7Nh2FVmIXviKl2VF",
          "id": "5FgPwJ7Nh2FVmIXviKl2VF",
          "is_local": false,
          "name": "Make You Feel My Love",
          "popularity": 70,
          "preview_url": "https://p.scdn.co/mp3-preview/3d9582dbaa291a0bdf96e750281595574f0de3ad?cid=cfe923b2d660439caf2b557b21f31221",
          "track_number": 9,
          "type": "track",
          "uri": "spotify:track:5FgPwJ7Nh2FVmIXviKl2VF"
        }
      ],
      "limit": 1,
      "next": "https://api.spotify.com/v1/search?query=artist:+Adele+track:+Make+you+feel+my+love&type=track&locale=en-US,en;q=0.9&offset=1&limit=1",
      "offset": 0,
      "previous": null,
      "total": 800
    }
  }
]))
}