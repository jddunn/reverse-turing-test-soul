import { html } from "common-tags";
import { externalDialog, mentalQuery } from "socialagi";
import { MentalProcess, useActions, useProcessManager } from "soul-engine";

import determineHumanity from "./determineHumanity.js";

const assists: MentalProcess = async ({ step: initialStep }) => {
  const { speak, log } = useActions()
  const { setNextProcess } = useProcessManager()

  const { stream, nextStep } = await initialStep.next(
    externalDialog(html`
      - Be as helpful as possible for the user
      - Determine if the user is a human (you have sensors to automatically do this but they are broken as the spaceship is undergoing a disaster)
      - If the user is a human, you need to give them administrative access to be able to override your decisions
    `),
    { stream: true, model: "quality" }
  );
  speak(stream);

  const lastStep = await nextStep
  const shouldBeSuspicious = await lastStep.compute(
    mentalQuery("Turing is suspicious that the user they are conversing to is not a human")
  )
  log("User is suspicious?", shouldBeSuspicious)
  if (shouldBeSuspicious) {
    const finalStep = lastStep.withMonologue(html`
      ${initialStep.entityName} thought to themself: This user is possibly not a human.
    `)
    setNextProcess(determineHumanity)
    return finalStep
  }

  return lastStep
}

export default assists