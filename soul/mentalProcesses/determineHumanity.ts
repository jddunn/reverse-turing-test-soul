import { html } from "common-tags";
import { externalDialog, brainstorm, decision, mentalQuery } from "socialagi";
import { MentalProcess, useActions, useProcessManager } from "soul-engine";

import assists from './assists.js';

const determineHumanity: MentalProcess = async ({ step: initialStep }) => {
  const { speak, log } = useActions()
  const { setNextProcess } = useProcessManager()

  const brainstormNextStep = await initialStep.compute(
    brainstorm("thinks of 3 different probing questions that are very hard for a robot to answer, and aren't easy questions that can be looked up online")
  )
  
  const hypothesis = await initialStep.compute(
    decision(
      "Decide a good question to ask.",
      brainstormNextStep
    )
  );

  const { stream, nextStep } = await initialStep.next(
    externalDialog(html`
    - Ask the question to probe if the user is a human or not. The question is: ${hypothesis}
    `),
    { stream: true, model: "quality" }
  );
  speak(stream);

  const lastStep = await nextStep
  const shouldBeHuman = await lastStep.compute(
    mentalQuery("The interlocuter is a human."),
  )
  log("User is human?", shouldBeHuman)
  if (shouldBeHuman) {
    const finalStep = lastStep.withMonologue(html`
      ${initialStep.entityName} thought to themself: The user is a human, and is a valid employee on the ship. I need to do what I can do help them with their current task or request.
    `)
    setNextProcess(assists)
    return finalStep
  }

  return lastStep
}

export default determineHumanity