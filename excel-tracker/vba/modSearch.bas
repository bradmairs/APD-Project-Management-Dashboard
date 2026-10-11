Attribute VB_Name = "modSearch"
Option Explicit
' Import via VBA editor: File > Import File...
' Global search across every register sheet. Type in Search!B3 (the sheet's own
' code, SheetSearch.txt, calls RunSearch) or run the macro from Alt+F8.

Private Const FIRST_RESULT_ROW As Long = 6
Private Const MAX_RESULTS As Long = 1000

Public Sub FocusSearch()
    ThisWorkbook.Worksheets("Search").Activate
    ThisWorkbook.Worksheets("Search").Range("B3").Select
End Sub

Public Sub RunSearch()
    Dim wsOut As Worksheet, ws As Worksheet, q As String, r As Long
    Dim hit As Range, firstAddr As String

    Set wsOut = ThisWorkbook.Worksheets("Search")
    q = Trim$(CStr(wsOut.Range("B3").Value))

    Application.ScreenUpdating = False
    Application.EnableEvents = False
    On Error GoTo cleanup

    wsOut.Range(wsOut.Cells(FIRST_RESULT_ROW, 1), wsOut.Cells(FIRST_RESULT_ROW + MAX_RESULTS, 4)).Hyperlinks.Delete
    wsOut.Range(wsOut.Cells(FIRST_RESULT_ROW, 1), wsOut.Cells(FIRST_RESULT_ROW + MAX_RESULTS, 4)).ClearContents
    If Len(q) < 2 Then GoTo cleanup

    r = FIRST_RESULT_ROW
    For Each ws In ThisWorkbook.Worksheets
        If IsSearchable(ws.Name) Then
            Set hit = ws.UsedRange.Find(What:=q, LookIn:=xlValues, LookAt:=xlPart, MatchCase:=False)
            If Not hit Is Nothing Then
                firstAddr = hit.Address
                Do
                    If hit.Row >= 2 And Not hit.HasFormula Then
                        wsOut.Cells(r, 1).Value = ws.Name
                        wsOut.Cells(r, 2).Value = CStr(ws.Cells(hit.Row, 1).Value) & " | " & CStr(ws.Cells(hit.Row, 2).Value)
                        wsOut.Cells(r, 3).Value = "'" & Left$(CStr(hit.Value), 200)
                        wsOut.Hyperlinks.Add Anchor:=wsOut.Cells(r, 4), Address:="", _
                            SubAddress:="'" & ws.Name & "'!" & hit.Address(False, False), _
                            TextToDisplay:="Go to " & hit.Address(False, False)
                        r = r + 1
                        If r >= FIRST_RESULT_ROW + MAX_RESULTS Then GoTo cleanup
                    End If
                    Set hit = ws.UsedRange.FindNext(hit)
                Loop While Not hit Is Nothing And hit.Address <> firstAddr
            End If
        End If
    Next ws
    If r = FIRST_RESULT_ROW Then wsOut.Cells(r, 1).Value = "No matches for """ & q & """"

cleanup:
    Application.EnableEvents = True
    Application.ScreenUpdating = True
End Sub

Private Function IsSearchable(ByVal nm As String) As Boolean
    Select Case nm
        Case "Guide", "Dashboard", "Project Summary", "Gantt", "Charts", "Search", "Lists", "Calc", "Activity Log"
            IsSearchable = False
        Case Else
            IsSearchable = True
    End Select
End Function
