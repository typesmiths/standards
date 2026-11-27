# Changing existing code

Most projects don't follow these rules everywhere yet. They get there one change at a time.

- **New code follows the rules,** even where the code beside it doesn't. Copy the [samples](samples.md) and the [do's and don'ts](dos-and-donts.md), not the nearest file.
- **Never add a new break:** no new loose domain function, `utils` file or second definition of a concept. Put the behaviour on its owner, even if that means turning a type into a class.
- **Rename when you touch it.** A file whose name doesn't say its purpose is renamed when you change it, and a file holding two things is split. Anything a package doesn't export can be renamed at any time.
- **Moves don't change behaviour.** A move lands behind the tests that already pass, one concept or class per change, with no behaviour change in the same change.
- **Measure, and only go down.** Where a project counts its breaks of these rules, CI fails when a count rises, and a change that fixes one lowers the count it is measured against.
- **A move that needs a decision stops for it.** If it's unclear who owns a fact, ask the project's owner rather than guess.
- **Only build the end result.** Don't write code to handle leftovers from the old way: old keys, leftover money, half-moved data. Clean those up by hand with the product's normal tools, and fix whatever caused them. Temporary code tends to stay forever.
- **Schema changes expand before they contract.** Never drop or rename a table or column that the currently deployed version still reads or writes. Add the new shape first, deploy code that stops using the old one, and drop the old shape in a later release.
- **Finish the whole change before showing it.** Update every caller, test, story and document, then show it. Don't stop halfway with a list of what's left.
