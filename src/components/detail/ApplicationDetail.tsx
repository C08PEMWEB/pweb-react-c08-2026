import type { ReactNode } from 'react'
import { CalendarPlus, FileText } from 'lucide-react'
import type { Application, ApplicationStatus, CvDocument } from '../../types'
import type { StatusTransitionPayload } from '../../utils/stateMachine'
import {
  addChecklistItem,
  removeChecklistItem,
  toggleChecklistItem,
} from '../../utils/checklist'
import { appendActivityLog } from '../../utils/activityLog'
import { findMatchingCvDocument } from '../../utils/cvVault'
import { ActivityLogSection } from './ActivityLogSection'
import { ChecklistSection } from './ChecklistSection'
import { FollowUpGenerator } from './FollowUpGenerator'
import { InterviewTimer } from './InterviewTimer'
import { StatusTransitionPanel } from './StatusTransitionPanel'
import { Button } from '../ui/Button'
import { Modal } from '../ui/Modal'

interface ApplicationDetailProps {
  application: Application
  kaptenSkills: string[]
  cvVault: readonly CvDocument[]
  onUpdate: (next: Application) => void
  onTransition: (
    target: ApplicationStatus,
    payload: StatusTransitionPayload,
  ) => void
  onPreviewCv: (cvId: string) => void
  onDownloadIcs: (app: Application) => void
  onClose: () => void
  headerActions?: ReactNode
}

export function ApplicationDetail({
  application,
  kaptenSkills,
  cvVault,
  onUpdate,
  onTransition,
  onPreviewCv,
  onDownloadIcs,
  onClose,
  headerActions,
}: ApplicationDetailProps) {
  const matchedCvDoc = findMatchingCvDocument(cvVault, application.cvVersion)

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={application.company}
      subtitle={`${application.role} · ${application.workMode}`}
      size="xl"
    >
      <div className="space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#E6DFD4] pb-4 dark:border-[#34312F]">
          <div className="space-y-1.5">
            {application.cvVersion && (
              <div className="flex flex-wrap items-center gap-2 text-sm text-[#57524B] dark:text-[#B5AFA7]">
                <span>Versi CV: {application.cvVersion}</span>
                {matchedCvDoc && (
                  <Button
                    variant="outline-green"
                    size="sm"
                    onClick={() => onPreviewCv(matchedCvDoc.id)}
                  >
                    <FileText className="h-3.5 w-3.5" />
                    <span>Lihat File CV</span>
                  </Button>
                )}
              </div>
            )}
            {application.interviewDateTime && (
              <div className="flex flex-wrap items-center gap-2 text-sm text-[#57524B] dark:text-[#B5AFA7]">
                <span>
                  Jadwal interview:{' '}
                  <time dateTime={application.interviewDateTime}>
                    {new Date(application.interviewDateTime).toLocaleString(
                      'id-ID',
                      { dateStyle: 'medium', timeStyle: 'short' },
                    )}
                  </time>
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => onDownloadIcs(application)}
                >
                  <CalendarPlus className="h-3.5 w-3.5" />
                  <span>Simpan .ics</span>
                </Button>
              </div>
            )}
          </div>
          {headerActions && (
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              {headerActions}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-5">
            <StatusTransitionPanel
              key={`${application.id}-${application.status}`}
              application={application}
              cvVault={cvVault}
              onTransition={onTransition}
            />
            <FollowUpGenerator
              key={`followup-${application.id}-${application.status}`}
              application={application}
              kaptenSkills={kaptenSkills}
              onLogCopy={(message) =>
                onUpdate(appendActivityLog(application, message))
              }
            />
            <div className="border-t border-[#E6DFD4] pt-5 dark:border-[#34312F]">
              <ChecklistSection
                checklist={application.checklist}
                onAdd={(text) =>
                  onUpdate(addChecklistItem(application, text))
                }
                onToggle={(id) =>
                  onUpdate(toggleChecklistItem(application, id))
                }
                onRemove={(id) =>
                  onUpdate(removeChecklistItem(application, id))
                }
              />
            </div>
          </div>

          <div className="space-y-5 border-t border-[#E6DFD4] pt-5 dark:border-[#34312F] lg:border-t-0 lg:border-l lg:pt-0 lg:pl-6">
            <InterviewTimer />
            <div className="border-t border-[#E6DFD4] pt-5 dark:border-[#34312F]">
              <ActivityLogSection
                logs={application.activityLogs}
                onAddNote={(message) =>
                  onUpdate(appendActivityLog(application, message))
                }
              />
            </div>
          </div>
        </div>
      </div>
    </Modal>
  )
}
