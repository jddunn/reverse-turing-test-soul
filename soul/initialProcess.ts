import { externalDialog } from "socialagi";
import { MentalProcess, useActions, useProcessManager } from "soul-engine";
import assists from "./mentalProcesses/assists.js";

const gainsTrustWithTheUser: MentalProcess = async ({ step: initialStep }) => {
  const { speak, log } = useActions()
  const { setNextProcess } = useProcessManager()

  const { stream, nextStep } = await initialStep.next(
    externalDialog("Greets or continues a normal conversation with the user."),
    { stream: true, model: "quality" }
  );
  speak(stream);

  const lastStep = await nextStep
  // const shouldShout = await lastStep.compute(
  //   mentalQuery("The interlocuter is being rude")
  // )
  // log("User attacked soul?", shouldShout)
  // if (shouldShout) {
  //   setNextProcess(shouts)
  // }

 setNextProcess(assists);

  // const shouldBeHuman = await lastStep.compute(
  //   mentalQuery("Is the user a human?")
  // )  

  return lastStep
}

export default gainsTrustWithTheUser
