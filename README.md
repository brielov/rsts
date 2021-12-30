# rsts

`rsts` is a naive port of Rust's Result and Option types written in TypeScript. It implements most functionallity of these types except for memory-related functions.

## Installation

```sh
npm install rsts
```

## Usage

```typescript
import { Ok, Err, Some, None } from "rsts";

const result = Ok(1);

result.isOk(); // true
result.unwrap(); // 1
result.unwrapErr(); // Error: called `Result.unwrapErr()` on an `Ok` value

const option = Some(1);

option.isSome(); // true
option.unwrap(); // 1;

// Real world example
function readFile(path: string): Result<string> {
  return Err(new Error("File not found"));
}

readFile("/path/to/file").match({
  Ok: (content) => {
    console.log(content);
  },
  Err: (error) => {
    console.error(error);
  },
});

function env(key: string): Option<string> {
  return process.env[key] ? Some(process.env[key]) : None;
}

env("NODE_ENV").match({
  Some: (value) => console.log(value),
  None: () => console.log("NODE_ENV is not set"),
});

const storage = {
  set(key: string, value: string): void {
    localStorage.setItem(key, value);
  },
  get(key: string): Option<string> {
    return localStorage.getItem(key) ? Some(localStorage.getItem(key)) : None();
  },
} as const;

storage.set("foo", "bar");
storage.get("foo").match({
  Some: (value) => console.log(value),
  None: () => console.log("foo is not set"),
});
```
