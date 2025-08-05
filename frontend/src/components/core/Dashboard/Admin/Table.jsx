export function Table({ children }) {
  return (
    <div className="flex flex-col">
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full align-middle">
          <div className="overflow-hidden border border-richblack-700 rounded-lg">
            <table className="min-w-full divide-y divide-richblack-700">
              {children}
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export function Thead({ children }) {
  return (
    <thead className="bg-richblack-700">
      {children}
    </thead>
  )
}

export function Tbody({ children }) {
  return (
    <tbody className="divide-y divide-richblack-700 bg-richblack-800">
      {children}
    </tbody>
  )
}

export function Tr({ children }) {
  return (
    <tr>
      {children}
    </tr>
  )
}

export function Th({ children }) {
  return (
    <th
      scope="col"
      className="px-6 py-3 text-left text-sm font-medium text-richblack-50"
    >
      {children}
    </th>
  )
}

export function Td({ children }) {
  return (
    <td className="whitespace-nowrap px-6 py-4 text-sm text-richblack-100">
      {children}
    </td>
  )
}
