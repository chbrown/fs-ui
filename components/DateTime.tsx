import * as React from 'react';
import * as moment from 'moment';

class DateTime extends React.Component<{date: Date | string | number, format?: string}, {}> {
  render() {
    const {date, format = 'YYYY-MM-DD h:mm A'} = this.props;
    if (date === undefined) {
      return <time />;
    }
    const text = moment(date).format(format);
    return <time dateTime={date instanceof Date ? date.toISOString() : date}>{text}</time>;
  }
  static propTypes = {
    date: React.PropTypes.oneOfType([React.PropTypes.object, React.PropTypes.string, React.PropTypes.number]).isRequired,
    format: React.PropTypes.string,
  }
}
export default DateTime;
