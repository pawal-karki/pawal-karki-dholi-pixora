
# Reset to the commit before our changes
git reset --mixed b95a628a

# Feb 08
$env:GIT_COMMITTER_DATE = "2026-02-08T12:00:00"
git add src/lib/validators/create-pipeline.ts src/lib/validators/lane-details.ts src/lib/validators/ticket-details.ts
git commit --date="2026-02-08T12:00:00" -m "feat: add validators for pipeline, lane, and ticket details"

# Feb 09
$env:GIT_COMMITTER_DATE = "2026-02-09T12:00:00"
git add src/queries/pipelines.ts src/queries/lanes.ts
git commit --date="2026-02-09T12:00:00" -m "feat: add pipeline and lane queries"

# Feb 10
$env:GIT_COMMITTER_DATE = "2026-02-10T12:00:00"
git add src/queries/tags.ts src/queries/tickets.ts
git commit --date="2026-02-10T12:00:00" -m "feat: add tag and ticket queries"

# Feb 11
$env:GIT_COMMITTER_DATE = "2026-02-11T12:00:00"
git add src/components/ui/tag.tsx
git commit --date="2026-02-11T12:00:00" -m "feat: add tag UI component"

# Feb 12
$env:GIT_COMMITTER_DATE = "2026-02-12T12:00:00"
git add src/components/forms/LaneDetails.tsx src/components/forms/PipelineDetails.tsx
git commit --date="2026-02-12T12:00:00" -m "feat: add lane and pipeline details forms"

# Feb 13
$env:GIT_COMMITTER_DATE = "2026-02-13T12:00:00"
git add src/components/forms/TagDetails.tsx src/components/forms/TicketDetails.tsx
git commit --date="2026-02-13T12:00:00" -m "feat: add tag and ticket details forms"

# Feb 14
$env:GIT_COMMITTER_DATE = "2026-02-14T12:00:00"
git add src/components/forms/PipelineSettings.tsx
git commit --date="2026-02-14T12:00:00" -m "feat: add pipeline settings form"

# Feb 15
$env:GIT_COMMITTER_DATE = "2026-02-15T12:00:00"
git add src/components/modules/pipelines/
git commit --date="2026-02-15T12:00:00" -m "feat: add pipeline module components"

# Feb 16
$env:GIT_COMMITTER_DATE = "2026-02-16T12:00:00"
git add src/app/api/media/ src/components/forms/upload-media.tsx
git commit --date="2026-02-16T12:00:00" -m "feat: add media API and upload form"

# Feb 17
$env:GIT_COMMITTER_DATE = "2026-02-17T12:00:00"
git add src/lib/utils.ts src/lib/types.ts src/lib/queries.ts
git commit --date="2026-02-17T12:00:00" -m "refactor: update utils, types, and general queries"

# Feb 18
$env:GIT_COMMITTER_DATE = "2026-02-18T12:00:00"
git add src/app/(main)/subaccount/[subaccountId]/media/page.tsx src/app/(main)/subaccount/[subaccountId]/pipelines/[pipelineId]/page.tsx
git commit --date="2026-02-18T12:00:00" -m "feat: update media and pipeline pages"

# Feb 19
$env:GIT_COMMITTER_DATE = "2026-02-19T12:00:00"
if (Test-Path tsc_output.txt) { Remove-Item tsc_output.txt -Force }
git add .
git commit --date="2026-02-19T12:00:00" -m "chore: cleanup and final updates"

# Force push
git push origin main --force
