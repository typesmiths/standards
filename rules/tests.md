# Tests

- **A spec sits beside the file it tests:** `order.entity.spec.ts` next to `order.entity.ts`. Nothing else a test needs sits there: fixtures, fakes, harnesses and contract tests go in `__fixtures__` beside the spec that needs them ([files and folders](files-and-folders.md#folders)). The code folders stay code.
- **Test behaviour through the public face,** from the caller's seat: build the real object, use it as a caller would, check what it did and what it shows. Never test a private method or a field.
- **Prefer a test at the user's level:** an HTTP call, a command-line run, a page. Unit tests cover what those can't reach.
- **Behaviour is proved in milliseconds.** A rule that waits for something (close once the spread narrows) is tested by setting what it waits on, never by simulating time passing or a market moving. Browser tests prove screens: each page and what it shows. What the code does across modules is proved by coded tests, in process.
- **Test what your code decides, not that a framework works.** Check a mapping against what it maps, and a query by what it returns from the framework's in-memory store, trusted and not under test. A test that only restates a line (that a query object holds the fields it was written with) fails only when the line is edited.
- **A stand-in for a service is a small class implementing its interface,** not a mock that records calls. When both exist, the stand-in passes the same contract test as the real one.
- **A neighbour the code under test asks is a fake that answers** as its contract says. A stand-in that throws when it's reached is for a neighbour the test must never reach, so an unexpected call fails loudly.
- **An interface with several implementations has one contract test** (`<thing>.contract-test.ts`, in `__fixtures__`) that each implementation's spec runs.
- **A consumer's expectations of a provider** live beside the provider as `<consumer>.contract.spec.ts`.
- **A bug fix starts with a test that fails** for the reason the bug report gives. Run it and see it fail, fix the code, then run the same test and see it pass.
- **While you work, one watch runs the tests your saves touch** (`vitest --watch --changed`), its output kept where the project's owner can follow it. Make the change and read what broke there; run nothing by hand beside it. The typecheck, format and lint run once a task is done; a module's whole suite and the full suite run in CI. A bug's failing test is the exception: it runs before the fix and after it.
- **Isolate a failure; never rerun to try a theory.** Read the code the first failure points at, and write the smallest test that shows the fault. Rerunning a suite, restarting the watch or booting a whole host to see whether a guess holds repeats green runs, and on a machine several sessions share it slows them all.
- **No test-only branches in product code.** If a test needs a seam, the seam is a constructor argument.
