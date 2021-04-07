01. **git hub page** Create organization.
02. **git hub page** Add member.
03. **git hub page** New Repository, with Readme.md and License.
04. **git hub page** Copy repository http path.
05. **Sourcetree** New-> Clone from URL -> paste.
06. **git hub page** create branch "dev_yourname"
07. **Sourcetree** Fetch 
08. **Sourcetree** origin-> double click dev_yourname-> checkout new local branch name
---
09.  do some changes on project.
10. **Sourcetree** Commit-> choose files-> write comment.
11. **Sourcetree** format:# comment: description
12. **Sourcetree** Push
13. **git hub page** Pull request
14.   contact owner to give approval.
15. **git hub page** Merge
16. **Sourcetree** right click origin/main-> Rebase
17. **Sourcetree** Push // make origin/dev_yourname to top
18. **Sourcetree** switch to main branch
19. **Sourcetree** Pull // make local/main to top
---
20.   if you want to push your work, but remote main was updated by others. 
21. **Sourcetree** File status-> Stash your files. // your files will move to STASHES
22. **Sourcetree** Pull
23. **Sourcetree** STASHES-> Apply stash // your files will merge to the latest version.
24. **Sourcetree** test your code and Push, follow step 09-19