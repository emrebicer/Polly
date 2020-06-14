import { Application, Router, send } from "https://deno.land/x/oak/mod.ts";
import { MongoClient } from "https://deno.land/x/mongo@v0.8.0/mod.ts";
import { config } from "https://deno.land/x/dotenv/mod.ts";
import { v4 } from "https://deno.land/std/uuid/mod.ts";

const PORT_NUMBER = 7777;
const { MONGO_DB_URI } = config();

// Connection to the mongo database
const client = new MongoClient();
client.connectWithUri(MONGO_DB_URI);
const DB = client.database("vote-test");
// Get the database connections
const DB_POLLS = DB.collection("polls");
const DB_VOTES = DB.collection("votes");

const router = new Router();
// API routes are defined and handled here
router.post("/api/create_poll", async (context) => {
  /* Example valid body data (as string)
    {
      poll_title: 'will anyone use this app?',
      poll_options: ['hell yeah', 'not at all!']
    }

	*/
  const body = await context.request.body();
	
	let requestedPoll:any = {}
	try{
		// Convert to JSON from string
		requestedPoll = JSON.parse(body.value);
	}
	catch(err){
		context.response.body = {
			success: false,
			info:
				`Please provide a valid JSON body`,
		};
		return;
	}

  // Check for the poll title
  if (!requestedPoll.poll_title || requestedPoll.poll_title.length < 1) {
    context.response.body = {
      success: false,
      info:
        `${requestedPoll.poll_title} is not a valid title, please provide a valid 'poll_title' parameter`,
    };
    return;
  }

  // Check for the poll options
  if (
    !requestedPoll.poll_options || !Array.isArray(requestedPoll.poll_options) ||
    requestedPoll.poll_options.length < 2
  ) {
    context.response.body = {
      success: false,
      info:
        `${requestedPoll.poll_options} is not a valid 'poll_options' argument`,
    };
    return;
  }

  // If passed all controls, create the poll and return success

	// Assign an id to each option, this id will be just numbers
	// starting from 0 to upwards. Could have been another UUID
	// but I didn't see the necessity of that.
  let optionsWithIDs = [];

  for (
    let optionIndex = 0;
    optionIndex < requestedPoll.poll_options.length;
    optionIndex++
  ) {
    optionsWithIDs.push({
      option_id: optionIndex,
      option_title: requestedPoll.poll_options[optionIndex],
    });
  }

  // Generate a unique poll id
  var pollUUID = v4.generate();

	// I don't want dashes(-) on the id, i will just remove them
	// (avoid complications on raw requests from browser)
  pollUUID = pollUUID.replace(/-/g, "");

  let insertStatus = await DB_POLLS.insertOne({
    poll_id: pollUUID,
    poll_title: requestedPoll.poll_title,
    poll_options: optionsWithIDs,
    poll_creation_date: Date(),
	});
	
	if(insertStatus){
		// Insertion was successful
		context.response.body = {
			success: true,
			info: "Successfully created a poll",
			poll_id: pollUUID,
		};
	}
	else{
		// Insertion failed
		context.response.body = {
			success: false,
			info: "Error on inserting the poll to the database",
		};
	}

})
  .get("/api/get_poll/:poll_id/:user_id", async (context) => {
    // Expected uri pattern
    // {domain}/api/get_poll/{poll_id}/{user_id}

    // Check if the poll exists
    let requestedPoll = await DB_POLLS.findOne({
      poll_id: context.params.poll_id,
    });

    if (!requestedPoll) {
      context.response.body = {
        success: false,
        info: `Poll with the id:${context.params.poll_id} was not found`,
      };
      return;
    }

    // Check if the user has already voted
    let currentUsersVote = await DB_VOTES.findOne({
      poll_id: context.params.poll_id,
      user_id: context.params.user_id,
    });

    if (currentUsersVote) {
      // User has already voted

      // Get the total vote counts for each option
      let allVotesToThisPoll = await DB_VOTES.find({
        poll_id: context.params.poll_id,
      });

      // Get all of the possible option index and title
      let pollVoteCounts = requestedPoll.poll_options;
      pollVoteCounts.forEach((vote: any) => {
        vote["total_vote_count"] = 0;
      });

      for (
        let currentVoteIndex = 0;
        currentVoteIndex < allVotesToThisPoll.length;
        currentVoteIndex++
      ) {
        pollVoteCounts.find(function (vote: any) {
          if (
            vote.option_id !=
              allVotesToThisPoll[currentVoteIndex].user_choice_index
          ) {
            return false;
          }
          vote.total_vote_count += 1;
          return true;
        });
      }

      context.response.body = {
        success: true,
        user_voted: true,
        info:
          `The poll exists and the user has already voted, will return resutls`,
        poll_title: requestedPoll.poll_title,
        poll_vote_counts: pollVoteCounts,
        current_user_choice_index: currentUsersVote.user_choice_index,
      };
      return;
    }

    // The user did not vote yet,
    // Just return the poll title and possible options
    context.response.body = {
      success: true,
      user_voted: false,
      info: `Found requested poll, user has not voted yet`,
      poll_title: requestedPoll.poll_title,
      poll_options: requestedPoll.poll_options,
    };
  })
  .post("/api/vote", async (context) => {
    const rawBody = await context.request.body();

    try {
      // Convert to JSON from string
      const body = JSON.parse(rawBody.value);

      if (!body.poll_id || !body.user_choice_index || !body.user_id) {
        context.response.body = {
          success: false,
          info:
            `Please provide 'poll_id', 'user_choice_index' and 'user_id' attributes in the request body as JSON.`,
        };
        return;
      }

      // Check if the poll with the given id exists
      let requestedPoll = await DB_POLLS.findOne({
        poll_id: body.poll_id,
      });

      if (!requestedPoll) {
        context.response.body = {
          success: false,
          info: `Could not find the poll with the id:${body.poll_id}`,
        };
        return;
      }

      // Check if the user has already voted
      let didUserVote = await DB_VOTES.findOne({
        poll_id: body.poll_id,
        user_id: body.user_id,
      });

      if (didUserVote) {
        // User has already voted
        context.response.body = {
          success: false,
          info:
            `User with the id:${body.user_id} has already voted to the poll with the id:${body.poll_id}`,
        };
        return;
      }

      // TO DO: It is not crucial, but also need to check
      // if the passed in option_index is a valid option
      // for this poll

      // If passes all controls, this vote is valid
      // insert to the DB
      let insertResult = await DB_VOTES.insertOne({
        user_id: body.user_id,
        poll_id: body.poll_id,
        vote_date: Date(),
        user_choice_index: body.user_choice_index,
      });

      if (insertResult) {
        context.response.body = {
          success: true,
          info: `Successfully voted`,
        };
        return;
      } else {
        context.response.body = {
          success: true,
          info: `Couldn't insert to the database`,
        };
        return;
      }
    } catch (err) {
      // An error occured
      context.response.body = {
        success: false,
        data: err.message,
      };
      return;
    }
  });

// Initialize the server
const app = new Application();
// Assign the defined routes
app.use(router.routes());
app.use(router.allowedMethods());

// Serve static content
app.use(async (context) => {
  await send(context, context.request.url.pathname, {
    root: `${Deno.cwd()}/public`,
    index: "index.html",
  });
});

// Listen for incoming requests
console.log(`listening on port: ${PORT_NUMBER}`);
await app.listen({ port: PORT_NUMBER });
