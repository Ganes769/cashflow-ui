import { Toaster as Sonner, type ToasterProps } from 'sonner'

function Toaster(props: ToasterProps) {
  return (
    <Sonner
      className="toaster group"
      position="bottom-right"
      toastOptions={{
        classNames: {
          toast: 'rounded-2xl bg-card text-foreground neo-raised text-[13px]',
          description: 'text-muted-foreground',
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
