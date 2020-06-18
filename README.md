# Polly
Polly is an open-source poll application
## Back-end
All of the API endpoints and the website itself is served on **Deno** from a single file called app.ts
### Run the server
```
deno run --allow-net --allow-write --allow-read --allow-plugin --unstable app.ts
```
### API endpoints
The API has 3 endpoints for creating a new poll, fetching a poll and voting to a poll

* **/api/create_poll** (POST)
  * This endpoint is used for creating new polls
  * Expects a stringified JSON that consists of poll_title and poll_options keys, returns JSON
  * There must be at least 2 options and at least 1 character length of poll title
  * ```
    Example request body
    
    {
      poll_title: 'The question of the poll',
      poll_options: ['first answer', 'second answer', 'third answer']
    }
    ```
  * ```
    Example response
    
    {
      success: true,
      info: '"Successfully created a poll',
      poll_id: 0123456789
    }
    ```

* **/api/get_poll/{poll_id}/{user_id}** (GET)
  * This endpoint is used for fetching the poll with the given poll id
  * Expects the poll_id and the user_id parameters from the url
  * If the poll exists, based on the user_id, it will return one of the followings
  * ```    
    The user has already voted
    
    {
      "success": true,
      "user_voted": true,
      "info": "The poll exists and the user has already voted, will return resutls",
      "poll_title": "The question of the poll",
      "poll_vote_counts": [
          {
              "option_id": 0,
              "option_title": "first option",
              "total_vote_count": 2
          },
          {
              "option_id": 1,
              "option_title": "second option",
              "total_vote_count": 1
          }
      ],
      "current_user_choice_index": "0"
    }
    ```
  * ```    
    The user has not voted yet
    
    {
        "success": true,
        "user_voted": false,
        "info": "Found requested poll, user has not voted yet",
        "poll_title": "The question of the poll",
        "poll_options": [
            {
                "option_id": 0,
                "option_title": "first option"
            },
            {
                "option_id": 1,
                "option_title": "second option"
            }
        ]
    }
    ```
* **/api/vote** (POST)
  * This endpoint is used for voting to an existing poll
  * Expects a stringified JSON that consists of poll_id and user_choice_index and user_id keys
  * It will return a JSON that consist of a success key (boolean), that represents whether the voting was succesful or not
  
