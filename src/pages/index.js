import React from "react";
import { useQuery, useMutation } from "@apollo/client";
import gql from "graphql-tag";
import {
  IoCheckmarkDoneCircleSharp,
  IoCheckmarkDoneCircleOutline,
} from "react-icons/io5";

const Home = () => {
  let inputText;

  const [addTodo] = useMutation(ADD_TODO);
  const [isDone] = useMutation(MARK_AS_DONE);
  const addTask = (e) => {
    e.preventDefault();
    addTodo({
      variables: {
        task: inputText.value,
      },
      refetchQueries: [{ query: GET_TODOS }],
    });
    inputText.value = "";
  };

  const handleDone = (todo) => {
    isDone({
      variables: {
        id: todo.id,
        isCompleted: todo.isCompleted,
      },
      refetchQueries: [{ query: GET_TODOS }],
    });
  };

  const { loading, error, data } = useQuery(GET_TODOS);

  if (loading)
    return (
      <div className="min-h-screen h-full absolute top-2/4 left-2/4 -mt-10 -ml-10">
        <h2 className="text-2xl text-center font-semibold">Loading..</h2>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen h-full absolute top-2/4 left-2/4 -mt-10 -ml-10">
        <h2 className="text-2xl text-center font-semibold">
          Oops, Something went wrong! <br /> Please Try Again Later!..
        </h2>
      </div>
    );

  return (
    <div className="mx-auto max-w-7xl w-full min-h-screen h-full">
      <div className="flex items-center justify-center">
        <div className="absolute top-2/4 -mt-32">
          <h2 className="text-2xl text-center font-semibold mb-5">Todo App</h2>
          <form onSubmit={addTask}>
            <input
              type="text"
              ref={(node) => {
                inputText = node;
              }}
              required
              className="border border-gray-700 block p-2 w-72 rounded-sm placeholder-black  focus:outline-none focus:ring-2 bg-transparent focus:ring-indigo-700 focus:border-transparent shadow-md"
              placeholder="Enter task to do.."
            />
            <button className="bg-indigo-700 text-white mt-2 w-72 h-10 rounded-sm hover:bg-indigo-800 focus:outline-none focus:ring-2 active:bg-indigo-800 focus:ring-indigo-700 focus:ring-offset-2 shadow-lg">
              Add Todo
            </button>
          </form>
          <div className="mt-16">
            <h2 className="text-2xl text-center font-semibold">Todo List</h2>
            <ul>
              {data.todos.map((todo) => (
                <li
                  key={todo.id}
                  className="mt-3 h-15 border shadow-sm hover:shadow-md cursor-pointer transition-all duration-500 ease-in-out p-3 flex items-center justify-between"
                >
                  <p className={`${todo.isCompleted ? "line-through" : ""}`}>
                    {todo.task}
                  </p>
                  <p>
                    {todo.isCompleted ? (
                      <IoCheckmarkDoneCircleSharp
                        onClick={() => handleDone(todo)}
                      />
                    ) : (
                      <IoCheckmarkDoneCircleOutline
                        onClick={() => handleDone(todo)}
                      />
                    )}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;

const GET_TODOS = gql`
  {
    todos {
      task
      id
      isCompleted
    }
  }
`;
const ADD_TODO = gql`
  mutation addTodo($task: String!) {
    addTodo(task: $task) {
      task
    }
  }
`;
const MARK_AS_DONE = gql`
  mutation isDone($id: ID!, $isCompleted: Boolean!) {
    isDone(id: $id, isCompleted: $isCompleted) {
      id
      isCompleted
    }
  }
`;
