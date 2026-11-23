# Tests

- **A spec sits beside the file it tests:** `order.entity.spec.ts` next to `order.entity.ts`.
- **Test behaviour through the public face,** from the caller's seat: build the real object, use it as a caller would, check what it did and what it shows. Never test a private method or a field.
- **Prefer a test at the user's level:** an HTTP call, a command-line run, a page. Unit tests cover what those can't reach.
- **A stand-in for a service is a small class implementing its interface,** not a mock that records calls. When both exist, the stand-in passes the same contract cases as the real one.
- **An interface with several implementations has one suite of cases** (`<thing>.cases.ts`, in `testing/`) that each implementation runs.
- **A consumer's expectations of a provider** live beside the provider as `<consumer>.contract.spec.ts`.
- **A bug fix starts with a test that fails** for the reason the bug report gives. Run it and see it fail, fix the code, then run the same test and see it pass.
- **Batch the work, then test once.** Make the whole change, in a few commits, with no checks between them; then run the typecheck, the tests related to the changed files and the contract tests your change can break, once. A module's whole suite and the full suite run in CI, on the push. A check between commits repeats what the final run covers, and on a machine several sessions share, it slows them all. A bug's failing test is the exception: it runs before the fix and after it.
- **No test-only branches in product code.** If a test needs a seam, the seam is a constructor argument.
