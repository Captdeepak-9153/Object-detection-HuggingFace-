import Image from 'next/image'
import { HfInference } from '@huggingface/inference'
import { HfAgent, LLMFromHub, defaultTools } from '@huggingface/agents'

import { blobToDataUrl } from '@/lib/utils'

const HF_TOKEN = process.env.HF_ACCESS_TOKEN
const inference = new HfInference(HF_TOKEN)
const agent = new HfAgent(HF_TOKEN, LLMFromHub(HF_TOKEN), [...defaultTools])

async function translate(inputs: string | string[]) {
  return await inference.translation({ inputs })
}

async function textToImage(inputs: string) {
  const blob = await inference.textToImage({
    inputs,
    parameters: {
      negative_prompt: 'blurry'
    }
  })

  const dataUrl = await blobToDataUrl(blob)
  return dataUrl
}

async function imageToText(inputs: string) {
  return await inference.imageToText({
    data: await (await fetch(inputs)).blob(),
    model: 'nlpconnect/vit-gpt2-image-captioning'
  })
}

export default async function HF() {
  // const result = await translate([
  //   'Hello, how are you?',
  //   'I am fine, thank you.'
  // ])

  // const dataUrl = await textToImage('A lion in the amazon forest')

  // const result = await imageToText('https://picsum.photos/300/300')

  // const code = await agent.generateCode(
  //   'Draw a picture of a cat wearing a top hat. Then caption the picture and read it out loud.'
  // )
  // console.log(code)
  // const messages = await agent.evaluateCode(code)
  // console.log(messages)

  return (
    <section className='py-24'>
      <div className='container'>
        <h1 className='text-3xl font-bold'>HF Inference</h1>

        {/* <div className='mt-4 rounded-md bg-gray-800 px-8 py-6 text-white'>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div> */}

        {/* <Image src={dataUrl} alt='result' width={400} height={300} /> */}
      </div>
    </section>
  )
}
