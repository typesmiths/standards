# Tests

- **A spec sits beside the file it tests:** `order.entity.spec.ts` next to `order.entity.ts`.
- **Test behaviour through the public face,** from the caller's seat: build the real object, use it as a caller would, check what it did and what it shows. Never test a private method or a field.
- **Prefer a test at the user's level:** an HTTP call, a command-line run, a page. Unit tests cover what those can't reach.
- **A stand-in for a service is a small class implementing its interface,** not a mock that records calls. When both exist, the stand-in passes the same contract cases as the real one.
- **An interface with several implementations has one suite of cases** (`<thing>.cases.ts`, in `testing/`) that each implementation runs.
- **A consumer's expectations of a provider** live beside the provider as `<consumer>.contract.spec.ts`.
- **A bug fix starts with a test that fails** for the reason the bug report gives. Run it and see it fail, fix the code, then run the same test and see it pass.
- **No test-only branches in product code.** If a test needs a seam, the seam is a constructor argument.
