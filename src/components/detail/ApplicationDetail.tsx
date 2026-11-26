import type { ReactNode } from 'react'
import type { Application, ApplicationStatus } from '../../types'
import type { StatusTransitionPayload } from '../../utils/stateMachine'
import {
  addChecklistItem,
  removeChecklistItem,
  toggleChecklistItem,
} from '../../utils/checklist'
import { appendActivityLog } from '../../utils/activityLog'
import { ActivityLogSection } from './ActivityLogSection'
import { ChecklistSection } from './ChecklistSection'
import { InterviewTimer } from './InterviewTimer'
import { StatusTransitionPanel } from './StatusTransitionPanel'
import { Modal } from '../ui/Modal'

interface ApplicationDetailProps {
  application: Application
  onUpdate: (next: Application) => void
  onTransition: (
    target: ApplicationStatus,
    payload: StatusTransitionPayload,
  ) => void
  onClose: () => void
  headerActions?: ReactNode
}

export function ApplicationDetail({
  application,
  onUpdate,
  onTransition,
  onClose,
  headerActions,
}: ApplicationDetailProps) {
  return (
    <Modal
      isOpen
      onClose={onClose}
      title={application.company}
      subtitle={`${application.role} • ${application.workMode}`}
      size="xl"
    >
      <div className="space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#E6DFD4] pb-4 dark:border-[#34312F]">
          <div className="space-y-1">
            {application.cvVersion && (
              <p className="text-sm text-[#57524B] dark:text-[#B5AFA7]">
                Versi CV: {application.cvVersion}
              </p>
            )}
            {application.interviewDateTime && (
              <p className="text-sm text-[#57524B] dark:text-[#B5AFA7]">
                Jadwal interview:{' '}
                <time dateTime={application.interviewDateTime}>
                  {new Date(application.interviewDateTime).toLocaleString(
                    'id-ID',
                    { dateStyle: 'medium', timeStyle: 'short' },
                  )}
                </time>
              </p>
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
              key={application.id}
              application={application}
              onTransition={onTransition}
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
