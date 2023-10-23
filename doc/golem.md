<p align="center">
<img src="../app/assets/images/logo.png" width="40%">
</p>


# Golem

### Phases
Plan -> Evaluate -> Coordinate -> [Recruit] -> Implement -> Reflect -> Refine

## Methods

#learn

learn about topics, summarize and refine


#ask

Ask for human intervention


#reflect

Reflect on the results produced, ensuring the result adheres to the constraints given to complete the task.

#remember

Store result in given memory context. 

[LLM Context] -> [Short Term (Summarized)] -> [Long Term (Logs)] -> [Indexed (DB)]

#summarize

### Sandbox Interface

#write

#read

## Reflections
Golems can self reflect for a number of iterations, ensuring the actions produced follow the conventions and produce the intended results.

## Conventions
Conventions are composable traits that you wish to apply to your Golems to make sure they adhere to your standards.

## Rituals
These are the workflows designed to solve a problem using your Golems

### Budgets
Set budgets for individual Golems and Rituals

# Golems

## Command Comprehension
Extract and interperet implied commands from the user.  

    Assistant: Here is the code as JSON
    ```json
        {"goat": {"pain": 1}}
    ```

    User: Please return code pretty formated.

In this example the user's message should be interpreted as a command and added to the golem's convention set or the global conventions. A function call can be returned to internally add this to the golem's context. 


    System: 
        ```yaml
            userCommands/prettyPrint:
                - Please return code pretty formated
        ```





# Context Minimap 

You can scrub through memory layers and full logs via the minimap to adjust the context window. If you'd only like to select messages from a specific golem you can filter the layers to only include messages from specific sources. 

You can summarize and commit messages to memory that fall within the range to produce higher level instructions over time. 

 








