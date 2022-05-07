#!/usr/bin/env node --experimental-specifier-resolution=node

import { Command } from "commander";
import * as commands from "./commands";

const program = new Command();

program
  .name("snek-functions")
  .description("Snek Functions CLI")
  .version("0.1.0");

program
  .command("server")
  .description("Start the functions server")
  .option("-p, --port <port>", "Port to listen on", "4000")
  .option(
    "-f, --functions-path <path>",
    "Path to functions directory",
    "./functions"
  )
  .option(
    "--watch",
    "Watch the functions folder and build on changes (Should be disabled for production)",
    false
  )

  .action(commands.server);

program
  .command("build")
  .description("Build the functions")
  .option(
    "-f, --functions-path <path>",
    "Path to functions directory",
    "./functions"
  )
  .action(commands.build);

program
  .command("init")
  .description("Initialize a new functions directory")
  .option("-f, --functions-path <path>", "Path to functions directory")
  .action(commands.init);

program.parse();
