import { RocketIcon } from '@primer/octicons-react'
import { Blankslate } from '@primer/react/experimental'

export default function Index() {
  return (
    <Blankslate>
      <Blankslate.Visual>
        <RocketIcon size="medium" />
      </Blankslate.Visual>
      <Blankslate.Heading>探索超椭圆曲线</Blankslate.Heading>
      <Blankslate.Description>
        超椭圆曲线是介于椭圆和矩形之间的数学曲线，在计算机图形学、建筑设计和艺术创作中有着广泛的应用。
      </Blankslate.Description>
      <Blankslate.PrimaryAction href="#">开始探索</Blankslate.PrimaryAction>
    </Blankslate>
  )
}
