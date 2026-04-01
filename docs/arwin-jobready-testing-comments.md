# things-we-can-improve

# Things I noticed

Step 1 in the left pane is not maintaining its state (after user does some progress, then we need to make sure the progress will be displaying instead of upload cv, start from scratch and tell your story – these should be moving to the top as small icons, once user starts creating his resume with one or the other option) .

Progress is not happening from step 1 to step 2\.  
Unable to upload resume.  
Not able to navigate from 

* step 1 to step2 or step 3 or step 4  
* step2 to step 3 or step 4  
* step 3 to step 4

Left side pane is not properly clickable

#  in step 2

AI enhance option, looks like it is hallucinating upon clicking  
Start date and end date should have calendar popups  
Bullet points are not displayed in preview  
 

## In step 4

Unable to generate resume  
Skills are not reflecting

## Misc

The copilot can display markdown format in preview mode rather than markdown mode (\*\*Customizing your skills section\*\* – **Customizing your skills section**)  
The copilot plane generates prompts like these, which are not clickable

![][image1] It might be better, if we have only one popup, and that gets changed upon changing the screen.

Profile Icon can be clickable.

The remaining things are working good (you did a good job within 3 days)

# Things we can add at upcoming phases

We might need to add more templates, and make sure that at any given point of step, users can change their template and details will reflect (we can add it in the upcoming phase).  
Resume analyzer at every step (from 1 to 5\)

## Closing comments

I believe, one round of testing after these above items are discussed/implemented, We can do another round of testing to further finetune it.

# Agents that will we need

# Agents that will we need

## Orchestrator agent

This is the agent by default used in the copilot pane, and user upon starting interacting with copilot and redirects to one of the below agents that will best suit the user query.

## Resume analysor and corrector/notifier agent

User goes from first step till 5th step, at every progression it should have analyze and progress button, when user clicks on analyze, this agent should be called to check if user is missing any detail or if there is anything not happening correctly and should generate a list of things that user can correct and here the agent should maintain state and should verify at each click of analyze (and see if user had implemented any of the suggestions) and give list of suggestions again (as user have messed up something correct or update and remove the things that user has implemented from previous suggestions)

## ATS score calculating agent

This agent takes a resume and analyzes and gives an ATS score.

## Role suggestor agent

This agent upon resume completion, suggests a set of roles to select one of them and a text box to ask user to enter a specific job role if user is not looking for the roles suggested by the system, then this should handoff the role and resume to \`HR-reviewer agent\`

## HR-reviewer agent

This agent, upon role selection will scan the resume from the target role HR eyes and suggest suggestions, this can also take job description as an input.

## Career coach agent

This agent should be called whenever career related questions are asked.

## Job tracker agent

This agent should be called whenever the user asks anything related to his job applications.

## Generic agent

Whenever the orchestrator feels that query is not applicable to any of the above agents, then this agent should be called and it will be better if it is a reasoning LLM.

# The plan

# Landing page

Landing page – login (should support login using google or linkedin or fb account) or signup (if the user hasn’t logged in)  
Users will have the below steps, the copilot chatbot (which first routes whatever user types to orchestrator agent and it decides further which agent should be called) will be available throughout these steps.  
Upon successful login, user will be directed to step 1

# Step 1 common set of questionnaire

User will be given a set of following questions, one by one to better aid him in the subsequent process of getting a job

1. His current domain  
2. He wants to switch his domain  
   1. If yes, get the user input and store it as target domain  
   2. If no, store his current domain as target domain  
3. His experience in the domain

All of this content will be used for the orchestrator to make better decisions while giving context or handoff to its worker agents.

# Step 2 Resume creation/enhancement

This flow will generally be into 2 steps

## Step 2.1 users with full resume

They will upload the resume, They will be directed to Step 3

## Step 2.2 users clicking on generate/regenerate resume

Here users will have 3 options that will populate the data into 5 steps (personal, Experience, Education, Skills, Preview (these 5 steps are already implemented in the code btw)).  
3 options:

- Upload existing resume to autopopulate data into the 5 steps, which user can edit and update as required  
- Create a resume from scratch, where the user will be directed to step 1 of 5 steps and gradually progresses. Before the user proceeds to the next step, the orchestrator should call \`Resume analysor and corrector/notifier agent\` and inform the user if they have any things that they can add before proceeding to the next level.

# Step 3 \- Calculating ATS score

here they will see the ATS score of the resume. Here along with the resume score we will give our verdict in one of the 2 ways.  
1 – we believe your resume will be good to proceed for role selection step  
2 – we believe you should regenerate the resume using 3.1.2 step   
Note: nevertheless we also give you a free hand to proceed in the way you want to.

### Step 3.1.1 users clicking on role selection step

User will be directed to step 4

### Step 3.1.2 users clicking on generate/regenerate resume

Users will be directed to step 2.2

# Step 4 \- shortlisting roles 

Here our \`Role suggestor agent\` will consider the content of the resume as input and then lists a set of roles that might suit him, also we will provide a text area, where he can type more than one roles separated by comma. Users can shortlist one or more roles.  
Now he will be directed to step 5

# Step 5 \- Reviewing the resume from HR lens for the jon applications user tries to apply

As the resume is generated and target roles are shortlisted, now user will be displayed the list of jobs and now the  \`HR-reviewer agent\`  should analyze target roles, each job link related description and tell the user what is good and what is missing and inform at what step in 2.2 should it use to correct them

# Step 6 \- tracking job applications

Whatever roles the user applies in step 5 should be automatically filling the following parameters whatever data is available for these following  fields should be filled \`\`\`'company name','product/service','hr name','started date','role','next update date','update','skills required','notes','jd link/data','status','what went wrong?','key points'\`\`\`

The \`Job tracker agent\` should use this data and answer questions related to user applied jobs in the chatbot section as well.

[image1]: <data:image/png;base64,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>