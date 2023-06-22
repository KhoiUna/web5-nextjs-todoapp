'use client'

import { Web5 } from '@tbd54566975/web5';
import { Record } from '@tbd54566975/web5/dist/types/record';
import { SyntheticEvent, useEffect, useRef, useState } from 'react';

type Todo = {
  record: Record
  data: {
    text: string
  }
  id: string
}

export default function Home() {
  const web5 = useRef<Web5>()
  const myDid = useRef('')

  const [todos, setTodos] = useState<Todo[]>([])

  useEffect(() => {
    const initWeb5 = async () => {
      const { web5: currentWeb5, did } = await Web5.connect()
      web5.current = currentWeb5
      myDid.current = did
    }
    initWeb5()
  }, [])

  useEffect(() => {
    const getTodos = async () => {
      if (!web5.current) return

      const { records } = await web5.current.dwn.records.query({
        message: {
          filter: {
            schema: 'http://some-schema-registry.org/todo'
          },
        }
      });

      if (!records) return setTodos([])

      const todos = []
      for (let record of records) {
        const data = await record.data.json()
        todos.push({ record, data, id: record.id })
      }

      return setTodos(todos)
    }
    getTodos()
  }, [])

  const [description, setDescription] = useState('')
  const addTodo = async (event: SyntheticEvent) => {
    event.preventDefault()
    try {
      if (!web5.current) throw 'Error init Web5'

      const { record } = await web5.current.dwn.records.create({
        data: { text: description },
        message: {
          schema: 'http://some-schema-registry.org/todo',
          dataFormat: 'application/json'
        }
      });

      if (!record) throw 'Error creating record'

      const data = await record.data.json();
      const todo = { record, data, id: record.id };
      setTodos(prev => ([todo, ...prev]))
      setDescription('')
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <main className="bg-slate-100 p-10 min-h-screen m-auto">
      <div className="w-fit m-auto">
        {todos.length === 0 && <p className='text-slate-500 text-center p-3 italic'>Nothing here yet!</p>}
        {todos.map((item, index) => (
          <TodoCard key={index} description={item.data.text} />
        ))}


        <form
          onSubmit={addTodo}
          className="w-[350px] h-[70px] bg-white drop-shadow-lg flex justify-around items-center p-3 my-3 rounded-lg text-slate-500">
          <input autoComplete='off' className='text-black outline-none border-2 border-black p-2 rounded-lg' type="text"
            value={description}
            onChange={({ target }) => setDescription(target.value)}
          />

          <button
            type="submit"
            className='bg-slate-50 p-2 rounded-lg ml-3'
          >Add</button>
        </form>
      </div>
    </main >
  )
}

function TodoCard({ description }: {
  description: string
}) {
  return (
    <div className="w-[350px] h-[70px] bg-white drop-shadow-lg flex justify-around items-center p-3 my-3 rounded-lg">
      <input type="checkbox" />

      <p className="truncate mx-3">{description}</p>

      <button type="button" className="text-red-500 bg-red-100 p-2 rounded-lg">
        <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 256 256"><path fill="currentColor" d="M216 48h-36V36a28 28 0 0 0-28-28h-48a28 28 0 0 0-28 28v12H40a12 12 0 0 0 0 24h4v136a20 20 0 0 0 20 20h128a20 20 0 0 0 20-20V72h4a12 12 0 0 0 0-24ZM100 36a4 4 0 0 1 4-4h48a4 4 0 0 1 4 4v12h-56Zm88 168H68V72h120Zm-72-100v64a12 12 0 0 1-24 0v-64a12 12 0 0 1 24 0Zm48 0v64a12 12 0 0 1-24 0v-64a12 12 0 0 1 24 0Z" /></svg>
      </button>
    </div>
  )
}