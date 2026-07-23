# your task
i need you to do the following:
1. setup all of these agents and skills below based on the explanations so that a skill can pull it all into a repo.
2. write a skill that will be called init-ai that will take a path to this folder and will initialize the app according this dev workflow below. this skills should be able to init an app and set the status and todos based on what is already done and not so it can integrate into existing repos as well as blank ones.
3. explain what the best way to implement the scheduled actions is for this to be a constantly improving and working towrd launch ready.

note: feel free to take a look at any existing skills in the user scope to see which would be useful here and pull them in if you want.


# the main stages
## plan
### spec
i will give the brief explanation of what i want. your job is to ask questions to make sure you understanding everything you need to do fully build out this app. if you are not confident about something you are not ready to proceed until you get an answer from me.
### detailed implement guide
from the answers you collect from be you will build an expanded version of the spec that include granular details about each feature and section as well as the approach to implement it and the order you will implement the features
### wire framing designs
you will then use the penpot mcp to create wire framing designs for each feature. this will be used to help you understand the flow of the app and how it will work. the design questions will you have will need to be answered in that initial spec conversation that we will have.
## dev
we cannot move to this stage until i approve the wire framing designs and the implement guide. once approved, this section will be an iterate automatically without a person (using crons or scheduled actions) until everything described is implemented, tested, and validated according to this flow.
### scaffold the app with all the basics
this is a do once at the beginning of the dev cycle so we have a baseline to work from.
### build authentication
this is the single most important feature of the app. we need to build a way for users to login and be able to use the app but prioritize security and privacy above everything else. lets get this set right away and make sure we have a solid foundation for the rest of the app to build on for authentication.
### build features
this will be a loop where we build out each feature in the app in four steps that loop until the feature is fully implemented.
there should be an agent assigned to the feature that will deploy the subagent steps listed below.
here are the steps:
1. write tests and implemenht the feature in code in parallel
    - this should be done by two separate subagents so they tests are not built just to be right but rather based on the feature specs
2. a validation agent
    - will run tests and well as inspect the feature-related code for quality, security, logic issues, and best practices.
    - if this fails we need to report back and write the tests that test the issue and fix the code to amend the issue
3. an integration validation agent
    - will run tests and well as inspect the entire codebase for quality, security, logic issues, and best practices.
    - if this fails we need to report back and write the tests that test the issue and fix the code to amend the issue
### after a feature is fully built we need to ensure it aligns with the implement guide and wire framing designs, then update the status of the feature in the docs file

## launch readiness
### staging deploy
this is manually done by my
### write acceptance tests
you will write out an acceptance test that explains a manual pass through all critical features of the app. from that document you will generate runnable test suites, playwright for the web surfaces and maestro for ios/android, that run against the staging environment to sanity check the app is working as expected.
